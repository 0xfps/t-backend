import ordersModel from "../db/schema/orders";
import { SHORT } from "../utils/constants";

/**
 * Returns all opened short orders, limited to 15,
 * sorted by price, in ascending descending (highest to lowest).
 * 
 * @param ticker Ticker.
 * @returns All open short orders.
 */
export default async function fetchOpenShortOrders(ticker: string) {
    const allOpenShortOrders = await ordersModel.find(
        {
            positionType: SHORT,
            ticker: ticker,
            deleted: false,
            filled: false
        }
    ).sort({ price: "descending" }).limit(15)

    if (allOpenShortOrders.length == 0) {
        return []
    }

    return allOpenShortOrders
}