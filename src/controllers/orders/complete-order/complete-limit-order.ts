import ordersModel from "../../../db/schema/orders";
import positionsModel from "../../../db/schema/positions";
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price";
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio";
import calculateTwap from "../../../utils/calculate-twap";
import { Order } from "../../../utils/constants";
import { getUniqueId } from "../../../utils/get-unique-id";
import { liquidatePositions } from "../../liquidator/liquidate-positions";

/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 * 
 * @param order 
 * @param completingOrders
 */
export default async function completeLimitOrder(order: any, completingOrders: any[]): Promise<[boolean, string]> {
    let status: boolean = true

    if (!order.filled) {
        // Get size of order to be filled.
        const totalOrderSize = parseInt(order.size)
        // Get orders that have filled the order to be filled so far.
        let totalFilledSize = parseInt(order.fillingOrders.reduce(function (total: any, fillingOrder: any) {
            return total + fillingOrder.size
        }, 0))

        // Get the remaining size to be filled.
        const fillingDifference = totalOrderSize - totalFilledSize

        // Iterate and fill the order up if the size of the order to fill the
        // initial order, when added to the current size is still below the
        // total size.
        completingOrders.forEach(async function (completingOrder: any) {
            const completingOrderSize = parseInt(completingOrder.size)
            if ((completingOrderSize + totalFilledSize) <= totalOrderSize) {
                // The completing order was fully executed.

                /**
                 * Position created for completing order, NOT THE MAIN ORDER.
                 */
                const entryPrice = parseInt(completingOrder.price)
                const completingOrderLeverage = parseInt(completingOrder.leverage)
                const timeOfPositionCreation = new Date().getTime()
                const positionIdOfCompletingOrder = getUniqueId(20)
                const completingOrderLiquidationPrice = calculateLiquidationPrice(
                    completingOrder.positionType,
                    entryPrice,
                    completingOrderLeverage,
                    calculateMarginRatio(completingOrderLeverage)
                )

                // 💡 Liquidate positions with liquidation prices here.
                // Liquidate positions.
                const liquidatablePositions = await positionsModel.find({ liquidationPrice: { $lte: entryPrice } })
                if (liquidatablePositions.length > 0)
                    await liquidatePositions(liquidatablePositions)
                // Liquidate positions.

                const completingOrdersPosition = await positionsModel.create({
                    orderId: completingOrder.orderId,
                    positionId: positionIdOfCompletingOrder,
                    opener: completingOrder.opener,
                    positionType: completingOrder.positionType,       // "long" | "short"
                    entryPrice: entryPrice,
                    liquidationPrice: completingOrderLiquidationPrice,
                    time: timeOfPositionCreation
                })

                const updateOrdersPosition = await ordersModel.updateOne(
                    { orderId: order.orderId },
                    // Not yet filled, but add the completing order.
                    { fillingOrders: [...order.fillingOrders, completingOrder.orderId] }
                )

                const updateCompletingOrdersPosition = await ordersModel.updateOne(
                    { orderId: completingOrder.orderId },
                    { filled: true, fillingOrders: [...completingOrder.fillingOrders, order.orderId] }
                )

                if (!completingOrdersPosition || !updateCompletingOrdersPosition || !updateOrdersPosition) {
                    status = false
                    return [false, "Complete limit order error 1."]
                }
                /**
                 * Position created for completing order, NOT THE MAIN ORDER.
                 */


                /**
                 * Position created for the main order.
                 */
                if (completingOrder.size + totalFilledSize == totalOrderSize) {
                    const { size, fillingOrders } = await ordersModel.findOne({ orderId: order.orderId })
                    // Update order to be filled.
                    const entryPrice = await calculateTwap(fillingOrders, parseInt(size))
                    const timeOfPositionCreation = new Date().getTime()
                    const orderLeverage = parseInt(order.leverage)

                    const positionIdOfOrder = getUniqueId(20)
                    const orderLiquidationPrice = calculateLiquidationPrice(
                        order.positionType,
                        entryPrice,
                        orderLeverage,
                        calculateMarginRatio(orderLeverage)
                    )

                    // 💡 Liquidate positions with liquidation prices here.
                    // Liquidate positions.
                    const liquidatablePositions = await positionsModel.find({ liquidationPrice: { $lte: entryPrice } })
                    if (liquidatablePositions.length > 0)
                        await liquidatePositions(liquidatablePositions)
                    // Liquidate positions.

                    // const ordersPosition = await positionsModel.create({
                    //     orderId: order.orderId,
                    //     positionId: positionIdOfOrder,
                    //     opener: order.opener,
                    //     positionType: order.positionType,       // "long" | "short"
                    //     entryPrice: entryPrice,
                    //     liquidationPrice: orderLiquidationPrice,
                    //     time: timeOfPositionCreation
                    // })

                    // const updateOrdersPosition = await ordersModel.updateOne(
                    //     { orderId: order.orderId },
                    //     { filled: true }
                    // )

                    // if (!ordersPosition || !updateOrdersPosition) {
                    //     status = false
                    //     return [false, "Complete limit order error 1."]
                    // }
                }

                totalFilledSize += completingOrderSize
            }
        })
    }

    return [status, ""]
}