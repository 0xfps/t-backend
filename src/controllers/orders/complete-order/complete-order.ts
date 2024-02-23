import ordersModel from "../../../db/schema/orders";
import positionsModel from "../../../db/schema/positions";
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price";
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio";
import calculateTwap from "../../../utils/calculate-twap";
import { MARKET, Order } from "../../../utils/constants";
import { getUniqueId } from "../../../utils/get-unique-id";
import { liquidatePositions } from "../../liquidator/liquidate-positions";
import completelyFillOrder from "../fill-order/completely-fill-order";
import partiallyFillOrder from "../fill-order/partially-fill-order";

/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 * 
 * @param order 
 * @param completingOrders
 */
export default async function completeOrder(order: any, completingOrders: any[]): Promise<[boolean, string]> {
    let status: boolean = true
    let reason: string = ""

    if (!order.filled) {
        // Get size of order to be filled.
        const totalOrderSize = parseFloat(order.size)
        let totalOrderSizeLeft = parseFloat(order.sizeLeft)

        // Iterate and fill the order up if the size of the order to fill the
        // initial order, when added to the current size is still below the
        // total size.
        // Orders coming here will pass the following criteria.
        // 1. Market.size <= Limit.size. (Markets can fill limit.)
        // 2. Limit.size !< Market.size. (Limits cannot fill market.)
        // 3. Market.size == Market.size.
        // 4. Limit.size >= Limit.size. (Limits can fill limits.)
        // 5. Limit.size <= Limit.size. (Limits can fill limits.)
        completingOrders.forEach(async function (completingOrder: any) {
            // Fill the order if the size left is > 0.
            if (totalOrderSizeLeft > 0) {
                const completingOrderSize = parseFloat(completingOrder.size)

                // If the size of the main order is still > the size of
                // the filling order, then go ahead and fill the main order.
                if (totalOrderSize > completingOrderSize) {
                    // Fill the completing order.
                    const [success1, reason1] = await completelyFillOrder(completingOrder, order)
                    // Partially open the order.
                    const [success2, reason2] = await partiallyFillOrder(order, completingOrder)

                    status = status && success1 && success2
                    reason += `${reason1}, ${reason2}. `

                    // Total order size left goes down.
                    totalOrderSizeLeft -= completingOrderSize
                }

                // If the size of the main order is still > the size of
                // the filling order, then go ahead and fill the main order.
                if (totalOrderSize < completingOrderSize) {
                    // Fill the completing order.
                    const [success1, reason1] = await completelyFillOrder(order, completingOrder)
                    // Partially open the order.
                    const [success2, reason2] = await partiallyFillOrder(completingOrder, order)

                    status = status && success1 && success2
                    reason += `${reason1}, ${reason2}. `

                    // Total order size left goes down.
                    totalOrderSizeLeft = 0
                }

                // Only one slot left.
                if (totalOrderSize == completingOrderSize) {
                    // Fill the main order.
                    const [success1, reason1] = await completelyFillOrder(order, completingOrder)
                    // Partially open the completing order.
                    const [success2, reason2] = await completelyFillOrder(completingOrder, order)

                    status = status && success1 && success2
                    reason += `${reason1}, ${reason2}. `

                    totalOrderSizeLeft = 0
                }
            }
        })
    }

    return [status, reason]
}