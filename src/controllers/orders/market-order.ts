import { LONG, Order, SHORT } from "../../utils/constants"
import processLongMarketOrder from "./long/long-market-order"
import processShortMarketOrder from "./short/short-market-order"

/**
 * This function processes market orders by delegating the
 * process to either one of two functions that process
 * market orders for long positions and market orders for
 * short positions.
 * 
 * @param order Order.
 * @returns Promise<[boolean, {}]>
 */
export default async function processMarketOrder(order: Order): Promise<[boolean, {}]> {
    const { positionType } = order

    let success = false, result = {}

    if (positionType == LONG)
        [success, result] = await processLongMarketOrder(order)

    if (positionType == SHORT)
        [success, result] = await processShortMarketOrder(order)

    return [success, result]
}