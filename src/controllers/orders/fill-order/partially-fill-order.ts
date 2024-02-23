import ordersModel from "../../../db/schema/orders"
import partialPositionsModel from "../../../db/schema/partial-positions"
import positionsModel from "../../../db/schema/positions"
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price"
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio"
import calculateTwap from "../../../utils/calculate-twap"
import { SHORT } from "../../../utils/constants"
import { getUniqueId } from "../../../utils/get-unique-id"
import { liquidatePositions } from "../../liquidator/liquidate-positions"

export default async function partiallyFillOrder(filledOrder: any, fillingOrder: any): Promise<[boolean, string]> {
    // Get the filling orders for the current order being filled.
    const { size, fillingOrders, sizeLeft } = await ordersModel.findOne({ orderId: filledOrder.orderId })
    // Get the entry price from the orders filling the stuff previously and the current one to fill it.
    const entryPrice = await calculateTwap([...fillingOrders, fillingOrder.orderId], parseFloat(size))
    const timeOfPositionCreation = new Date().getTime()
    const leverage = parseInt(filledOrder.leverage)
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

    const partiallyFilledOrderExists = await partialPositionsModel.findOne({ orderId: filledOrder.orderId })

    const percentageFilled = parseFloat((100 - (((sizeLeft - fillingOrder.size) / size) * 100)).toFixed(2))

    let partialPosition

    if (partiallyFilledOrderExists.length == 0) {
        partialPosition = partialPositionsModel.create({
            orderId: filledOrder.orderId,
            positionId: positionIdOfOrder,
            opener: filledOrder.opener,
            positionType: filledOrder.positionType,       // "long" | "short"
            entryPrice: entryPrice,
            liquidationPrice: liquidationPrice,
            fundingRate: 0, // 0% for a start.
            isComplete: false,
            percentageFilled: percentageFilled,
            time: timeOfPositionCreation
        })
    } else {
        partialPosition = partialPositionsModel.updateOne(
            { orderId: filledOrder.orderId },
            {
                entryPrice: entryPrice,
                liquidationPrice: liquidationPrice,
                isComplete: false,
                percentageFilled: percentageFilled,
                time: timeOfPositionCreation
            }
        )
    }
    
    if (!partialPosition) {
        return [false, "Position could not be created!"]
    }

    const updateOrderEntry = await ordersModel.updateOne(
        { orderId: filledOrder.orderId },
        {
            sizeLeft: filledOrder.sizeLeft - fillingOrder.size
        }
    )

    if (!updateOrderEntry) {
        return [false, "Order entry could not be updated!"]
    }
    
    return [true, `Order ${filledOrder.orderId} filled!`]
}