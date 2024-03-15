import { LONG, Order, SHORT } from "../../utils/constants"
import processLongLimitOrder from "./long/long-limit-order"
import processShortLimitOrder from "./short/short-limit-order"

/**
 * Takes an order, validated to be a limit order and processes it
 * either as a short limit or as a long limit order.
 * 
 * @param order Order.
 * @returns Promise<[boolean, {}]> Return data.
 */
export default async function processLimitOrder(order: Order): Promise<[boolean, {}]> {
    const { positionType } = order

    let success = false, result = {}

    if (positionType == LONG)
        [success, result] = await processLongLimitOrder(order)

    if (positionType == SHORT)
        [success, result] = await processShortLimitOrder(order)

    return [success, result]
}