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
export default async function processShortMarketOrder(order: Order): Promise<[boolean, {}]> {
    // Check in long orders to see if there are any orders matching within 20% slippage
    // of order price and order size.
    // User below is trying to sell as much as caller is trying to buy.
    const openLongOrders = await ordersModel.find({
        positionType: LONG,
        // Can one fill a market order with a limit order?
        type: MARKET,
        ticker: order.ticker.toLowerCase(),
        size: order.size,
        // Get long orders where the selling price is within 20% slippage of the
        // buying price of the market and the selling price.
        price: { $gte: calculateSlippage(SHORT, order.price, 20), $lte: order.price }
    }).sort({ time: -1, price: -1 }) // Sort by most recent first. 🚨 Possible bug.

    // If no long orders matching the user's market order are open, then only
    // add data to database because an order must be made to be taken in Aori.
    if (!openLongOrders || openLongOrders.length == 0) {
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
    }

    // If found, take order via Aori, then take order using what's found.

    // Make return match.
    // 🚨🚨🚨🚨🚨🚨🚨🚨
    return [false, {}]
}