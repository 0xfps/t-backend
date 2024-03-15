import ordersModel from "../../db/schema/orders"
import { calculateSlippage } from "../../utils/calculate-slippage"
import { LIMIT, LONG, SHORT } from "../../utils/constants"
import completeOrder from "../orders/complete-order/complete-order"

/**
 * This function takes in an array of long limit orders and tries to
 * match them with any available short limit order found in the database.
 * 
 * @param longLimitOrders An array of long limit orders.
 */
export default async function match(longLimitOrders: any[]) {
    longLimitOrders.forEach(async function (longLimitOrder: any) {
        // Check in short orders to see if there are any orders matching within slippage
        // of order price and order size.
        // User below is trying to sell as much as caller is trying to buy.
        const openShortOrders = await ordersModel.find({
            positionType: SHORT,
            // Can one fill a market order with a limit order?
            type: LIMIT,
            ticker: longLimitOrder.ticker.toLowerCase(),
            // No need for order size, it's an aggregation.
            // Get short orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: calculateSlippage(LONG, longLimitOrder.price), $lte: longLimitOrder.price },
            filled: false
        }).sort({ time: 1, price: 1 })

        if (openShortOrders.length > 0) {
            await completeOrder(longLimitOrder, openShortOrders)
        }
    })
}