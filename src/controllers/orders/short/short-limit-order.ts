import ordersModel from "../../../db/schema/orders";
import userAddressesModel from "../../../db/schema/user-addreses";
import ResponseInterface from "../../../interfaces/response-interface";
import { calculateSlippage } from "../../../utils/calculate-slippage";
import { LIMIT, LONG, MARKET, Order, SHORT } from "../../../utils/constants";
import decrementMargin from "../../../utils/decrement-margin";
import { getUniqueId } from "../../../utils/get-unique-id";
import completeOrder from "../complete-order/complete-order";

/**
 * Processes a short limit order.
 * 
 * @param order Order
 * @returns Promise<[boolean, {}]>
 */
export default async function processShortLimitOrder(order: Order): Promise<[boolean, {}]> {
    const { user } = await userAddressesModel.findOne({ tWallet: order.opener })

    // Check in long orders to see if there are any orders matching within 20% slippage
    // of order price and order size.
    // User below is trying to sell as much as caller is trying to buy.
    const openLongLimitOrders = await ordersModel.find({
        positionType: LONG,
        // Can one fill a market order with a limit order?
        type: LIMIT,
        ticker: order.ticker.toLowerCase(),
        opener: { $ne: user },
        // No need for order size, it's an aggregation.
        // Get long orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: order.price, $lte: calculateSlippage(SHORT, order.price) },
        filled: false,
        deleted: false
    }).sort({ time: 1, price: -1 })

    const openLongMarketOrders = await ordersModel.find({
        positionType: LONG,
        // Can one fill a market order with a limit order?
        type: MARKET,
        ticker: order.ticker.toLowerCase(),
        opener: { $ne: user },
        size: { $lte: order.size },
        // No need for order size, it's an aggregation.
        // Get long orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: order.price, $lte: calculateSlippage(SHORT, order.price) },
        filled: false,
        deleted: false
    }).sort({ time: 1, price: -1 })

    const allOpenLongOrders = [...openLongLimitOrders, ...openLongMarketOrders]

    // Short limit price must be >= market price.
    if (order.price < order.marketPrice)
        return [false, "Short limit price cannot be less than market price."]

    // If no long orders matching the user's market order are open, then only
    // add data to database because an order must be made to be taken in Aori.
    const orderId = getUniqueId(20)
    const time = new Date().getTime()

    const createdOrder = await ordersModel.create({
        orderId,
        ...order,
        sizeLeft: order.size,
        filled: false,
        fillingOrders: [],
        deleted: false,
        time
    })

    if (!createdOrder) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Error creating order!"
        }

        return [false, response]
    }

    if (!allOpenLongOrders || allOpenLongOrders.length == 0) {
        // 💡 Reduce user's margin.
        const decremented = await decrementMargin(user, (order.margin + order.fee))
        return decremented ? [true, "Order Created!"] : [false, "Margin could not be deducted."]
    }

    // 💡 Reduce user's margin.
    const decremented = await decrementMargin(user, (order.margin + order.fee))

    if (!decremented) {
        return [false, "Margin could not be deducted."]
    }

    const [completed, reason] = await completeOrder(createdOrder, allOpenLongOrders)

    return [completed, { result: reason }]
}