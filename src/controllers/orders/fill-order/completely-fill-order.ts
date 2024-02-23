import ordersModel from "../../../db/schema/orders"
import partialPositionsModel from "../../../db/schema/partial-positions"
import positionsModel from "../../../db/schema/positions"
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price"
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio"
import { SHORT } from "../../../utils/constants"
import { getUniqueId } from "../../../utils/get-unique-id"
import { liquidatePositions } from "../../liquidator/liquidate-positions"

// Fills `filledOrder` completely and closes the DB.
// The focus is on `filledOrder`, not `fillingOrder`.
export default async function completelyFillOrder(filledOrder: any, fillingOrder: any): Promise<[boolean, string]> {
    const entryPrice = filledOrder.positionType == SHORT ? filledOrder.price : fillingOrder.price
    const leverage = parseInt(filledOrder.leverage)
    const timeOfPositionCreation = new Date().getTime()
    const positionIdOfOrder = getUniqueId(20)
    const liquidationPrice = calculateLiquidationPrice(
        filledOrder.positionType,
        entryPrice,
        leverage,
        calculateMarginRatio(leverage)
    )

    // 💡 Liquidate positions with liquidation prices here.
    // Liquidate positions.
    const liquidatablePositions = await positionsModel.find({ liquidationPrice: { $lte: entryPrice } })
    if (liquidatablePositions.length > 0)
        await liquidatePositions(liquidatablePositions)
    // Liquidate positions.

    const createdPosition = await positionsModel.create({
        orderId: filledOrder.orderId,
        positionId: positionIdOfOrder,
        opener: filledOrder.opener,
        positionType: filledOrder.positionType,       // "long" | "short"
        entryPrice: entryPrice,
        liquidationPrice: liquidationPrice,
        fundingRate: 0, // 0% for a start.
        time: timeOfPositionCreation
    })

    if (!createdPosition) {
        return [false, "Position could not be created!"]
    }

    const updateOrderEntry = await ordersModel.updateOne(
        { orderId: filledOrder.orderId },
        {
            filled: true,
            deleted: true,
            sizeLeft: 0,
            fillingOrders: [...filledOrder.fillingOrders, fillingOrder.orderId]
        }
    )

    if (!updateOrderEntry) {
        return [false, "Order entry could not be updated!"]
    }

    const orderInPartialPosition = await partialPositionsModel.findOne({ orderId: filledOrder.orderId })
    if (orderInPartialPosition) {
        const update = await partialPositionsModel.deleteOne({ order: filledOrder.orderId })
        if (!update) {
            return [false, "Could not delete partial order!"]
        }
    }

    return [true, `Order ${filledOrder.orderId} filled!`]
}