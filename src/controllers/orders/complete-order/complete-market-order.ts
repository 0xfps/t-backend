import ordersModel from "../../../db/schema/orders";
import positionsModel from "../../../db/schema/positions";
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price";
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio";
import { Order } from "../../../utils/constants";
import { getUniqueId } from "../../../utils/get-unique-id";

/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 * 
 * @param longOrder 
 * @param shortOrder 
 */
export default async function completeMarketOrder(order: Order, completingOrder: any): Promise<[boolean, string]> {
    
    // Create a new filled order for order.
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
        return [false, "Making order not created!"]
    }

    const entryPrice = completingOrder.price
    const timeOfPositionCreation = new Date().getTime()

    const positionIdOfOrder = getUniqueId(20)
    const orderLiquidationPrice = calculateLiquidationPrice(
        order.positionType,
        entryPrice,
        order.leverage,
        calculateMarginRatio(order.leverage)
    )

    const positionIdOfCompletingOrder = getUniqueId(20)
    const completingOrderLiquidationPrice = calculateLiquidationPrice(
        completingOrder.positionType,
        entryPrice,
        completingOrder.leverage,
        calculateMarginRatio(completingOrder.leverage)
    )

    const ordersPosition = await positionsModel.create({
        orderId: orderId,
        positionId: positionIdOfOrder,
        positionType: order.positionType,       // "long" | "short"
        entryPrice: entryPrice,
        liquidationPrice: orderLiquidationPrice,
        time: timeOfPositionCreation
    })

    const completingOrdersPosition = await positionsModel.create({
        orderId: completingOrder.orderId,
        positionId: positionIdOfCompletingOrder,
        positionType: completingOrder.positionType,       // "long" | "short"
        entryPrice: entryPrice,
        liquidationPrice: completingOrderLiquidationPrice,
        time: timeOfPositionCreation
    })

    // Valid that the completing order entirely fills the order.

    if (!ordersPosition || !completingOrdersPosition) {
        return [false, "Complete market order error 1."]
    }

    // Update the two orders.
    const updateOrdersPosition = await ordersModel.updateOne(
        { orderId: orderId },
        { filled: true, fillingOrders: [completingOrder.orderId] }
    )

    const updateCompletingOrdersPosition = await ordersModel.updateOne(
        { orderId: completingOrder.orderId },
        { filled: true, fillingOrders: [orderId] }
    )

    if (!updateOrdersPosition || !updateCompletingOrdersPosition) {
        return [false, "Complete market order error 1."]
    }

    return [true, ""]
}