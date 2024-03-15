import ordersModel from "../db/schema/orders";
import { LONG } from "../utils/constants";

/**
 * Returns all opened long orders, limited to 15,
 * sorted by price, in ascending order (lowest to highest).
 * 
 * @param ticker Ticker.
 * @returns All open long orders.
 */
export default async function fetchOpenLongOrders(ticker: string) {
    const allOpenLongOrders = await ordersModel.find(
        {
            positionType: LONG,
            ticker: ticker,
            deleted: false,
            filled: false
        }
    ).sort({ price: "ascending" }).limit(15)

    if (allOpenLongOrders.length == 0) {
        return []
    }

    return allOpenLongOrders
}