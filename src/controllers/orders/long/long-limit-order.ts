import ordersModel from "../../../db/schema/orders";
import userAddressesModel from "../../../db/schema/user-addreses";
import ResponseInterface from "../../../interfaces/response-interface";
import { calculateSlippage } from "../../../utils/calculate-slippage";
import { LIMIT, LONG, Order, SHORT, SPREAD } from "../../../utils/constants";
import decrementMargin from "../../../utils/decrement-margin";
import { getUniqueId } from "../../../utils/get-unique-id";
import completeLimitOrder from "../complete-order/complete-limit-order";

/**
 * Process a long limit order.
 * 
 * @param order Order.
 * @returns 
 */
export default async function processLongLimitOrder(order: Order): Promise<[boolean, {}]> {
    // Check in short orders to see if there are any orders matching within 20% slippage
    // of order price and order size.
    // User below is trying to sell as much as caller is trying to buy.
    const openShortOrders = await ordersModel.find({
        positionType: SHORT,
        // Can one fill a market order with a limit order?
        type: LIMIT,
        ticker: order.ticker.toLowerCase(),
        // No need for order size, it's an aggregation.
        // Get short orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: calculateSlippage(LONG, order.price), $lte: order.price },
        filled: false
    }).sort({ time: 1, price: 1 }) // Sort by first post first. 🚨 Possible bug.

    const { user } = await userAddressesModel.findOne({ tWallet: order.opener })

    // If not short orders matching the user's market order are open, then
    // add data to database and then make order.
    const orderId = getUniqueId(20)
    // 32, making it more unique and trackable, if desired.
    const aoriOrderId = `${orderId}-${getUniqueId(20)}`
    const time = new Date().getTime()

    const createdOrder = await ordersModel.create({
        orderId,
        aoriOrderId,
        ...order,
        filled: false,
        fillingOrders: [],
        time
    })

    if (!createdOrder) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Error creating order!"
        }
        return [false, response]
    }

    if (!openShortOrders || openShortOrders.length == 0) {
        await decrementMargin(user, order.margin)
        return [true, "Order Created!"]
    }

    // 💡 Reduce user's margin.
    await decrementMargin(user, order.margin)
    const [completed, reason] = await completeLimitOrder(createdOrder, openShortOrders)

    return [completed, reason]
}