import ordersModel from "../../../db/schema/orders"
import ResponseInterface from "../../../interfaces/response-interface"
import { calculateSlippage } from "../../../utils/calculate-slippage"
import { LONG, MARKET, Order, SHORT } from "../../../utils/constants"
import { getUniqueId } from "../../../utils/get-unique-id"
/**
 * Long market order process.
 * 
 * @param order Order.
 * @returns 
 */
export default async function processLongMarketOrder(order: Order): Promise<[boolean, {}]> {
    // Check in short orders to see if there are any orders matching within 20% slippage
    // of order price and order size.
    // User below is trying to sell as much as caller is trying to buy.
    const openShortOrders = await ordersModel.find({
        positionType: SHORT,
        // Can one fill a market order with a limit order?
        type: MARKET,
        ticker: order.ticker.toLowerCase(),
        size: order.size,
        // Get short orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: calculateSlippage(LONG, order.price, 20), $lte: order.price }
    }).sort({ time: -1, price: -1 }) // Sort by most recent first. 🚨 Possible bug.

    // If not short orders matching the user's market order are open, then
    // add data to database and then make order.
    if (!openShortOrders || openShortOrders.length == 0) {
        const orderId = getUniqueId(20)
        // 32, making it more unique and trackable, if desired.
        const aoriOrderId = `${orderId}-${getUniqueId(20)}`
        const time = new Date().getTime()

        const createdOrder = await ordersModel.create({
            orderId,
            aoriOrderId,
            ...order,
            time
        })

        if (!createdOrder) {
            const response: ResponseInterface = {
                status: 400,
                msg: "Error creating order!"
            }
            return [false, response]
        }

        // Make order via Aori.
    }

    // If found, make order via Aori, then take order using what's found.

    // Make return match.
    // 🚨🚨🚨🚨🚨🚨🚨🚨
    return [false, {}]
}