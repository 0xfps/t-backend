import ordersModel from "../db/schema/orders";
import fundingRate from "./funding-rate";

/**
 * Using the passed ticker, the code takes the last order
 * submitted for that ticker and evaluates the time of 
 * submission. If the time is older than 5 minutes, then
 * funding rate is charged.
 * 
 * @param ticker Ticker.
 */
export default async function checkForNewOrders(ticker: string) {
    const allOrders = await ordersModel.find({}).sort({ time: "descending" })
    if (allOrders.length == 0) return

    const lastOrder = allOrders[allOrders.length]

    if ((new Date().getTime() - lastOrder.time) > 300_000) {
        await fundingRate(ticker)
    }
}