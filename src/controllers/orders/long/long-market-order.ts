import ordersModel from "../../../db/schema/orders"
import userAddressesModel from "../../../db/schema/user-addreses"
import ResponseInterface from "../../../interfaces/response-interface"
import { calculateSlippage } from "../../../utils/calculate-slippage"
import { LIMIT, LONG, MARKET, Order, SHORT, SPREAD } from "../../../utils/constants"
import decrementMargin from "../../../utils/decrement-margin"
import { getUniqueId } from "../../../utils/get-unique-id"
import completeOrder from "../complete-order/complete-order"
/**
 * Long market order process.
 * 
 * @param order Order.
 * @returns Promise<[boolean, {}]>
 */
export default async function processLongMarketOrder(order: Order, isClosingOrder: boolean): Promise<[boolean, {}]> {
    const { user } = await userAddressesModel.findOne({ tWallet: order.opener })

    // Check in short orders to see if there are any orders matching within 20% slippage
    // of order price and order size.
    // User below is trying to sell as much as caller is trying to buy.
    const openShortMarketOrders = await ordersModel.find({
        positionType: SHORT,
        // Can one fill a market order with a limit order?
        type: MARKET,
        ticker: order.ticker.toLowerCase(),
        opener: { $ne: user },
        size: order.size,
        // Get short orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: calculateSlippage(LONG, order.price), $lte: order.price },
        filled: false,
        deleted: false
    }).sort({ time: 1, price: -1 })

    const openShortLimitOrders = await ordersModel.find({
        positionType: SHORT,
        // Can one fill a market order with a limit order?
        type: LIMIT,
        ticker: order.ticker.toLowerCase(),
        opener: { $ne: user },
        size: { $gte: order.size },
        // Get short orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: calculateSlippage(LONG, order.price), $lte: order.price },
        filled: false,
        deleted: false
    }).sort({ time: 1, price: -1 })

    const allOpenShortOrders = [...openShortLimitOrders, ...openShortMarketOrders]

    // If not short orders matching the user's market order are open, then
    // add data to database and then make order.

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

    // Deduct margin if this is not a close order.
    if (!allOpenShortOrders || allOpenShortOrders.length == 0) {
        if (!isClosingOrder) {
            // 💡 Reduce user's margin.
            const decremented = await decrementMargin(user, (order.margin + order.fee))
            return decremented ? [true, "Order Created!"] : [false, "Margin could not be deducted."]
        }
    }

    if (!isClosingOrder) {
        // 💡 Reduce user's margin.
        const decremented = await decrementMargin(user, (order.margin + order.fee))

        if (!decremented) {
            return [false, "Margin could not be deducted."]
        }
    }

    /**
     * If an order is found on the short side, it is expected to fill the long
     * as it is market.
     * An open order is found.
     * An order is filled.
     * Two positions are created. One for long, one for short.
     */
    const [completed, reason] = await completeOrder(
        createdOrder,
        allOpenShortOrders,
        isClosingOrder,
        order.initialPriceBeforeClose
    )

    if (!completed) {
        return [false, { result: reason }]
    }

    return [true, { response: reason }]
}