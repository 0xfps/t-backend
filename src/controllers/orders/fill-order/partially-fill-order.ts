import ordersModel from "../../../db/schema/orders"
import partialPositionsModel from "../../../db/schema/partial-positions"
import positionsModel from "../../../db/schema/positions"
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price"
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio"
import calculateTwap from "../../../utils/calculate-twap"
import { getUniqueId } from "../../../utils/get-unique-id"
import { liquidatePositions } from "../../liquidator/liquidate-positions"

/**
 * There are two ways of filling an order:
 * 1. Partial filling.
 * 2. Complete filling.
 * 
 * PARTIAL FILLING.
 * This type of filling is ONLY applicable to LIMIT orders, i.e, for an order to
 * get to this point, it has to be a limit order. As limit orders have to be equal to
 * or of a higher size than market orders. Understand it as "the `fillingOrder` is partially
 * filling the `filledOrder`".
 * 
 * Partially filling the `filledOrder` creates a partial position for the `filledOrder`. The
 * `fillingOrder` is untouched here. Why? Because, this function ONLY partially fills the `filledOrder`.
 * 
 * @param filledOrder   Order to be filled.
 * @param fillingOrder  Order filling the one above.
 * @returns Promise<[boolean, string]>
 */
export default async function partiallyFillOrder(filledOrder: any, fillingOrder: any): Promise<[boolean, string]> {
    // Get the filling orders for the current order being filled.
    const { size, sizeLeft } = await ordersModel.findOne({ orderId: filledOrder.orderId })
    // Get the entry price from the orders filling the stuff previously and the current one to fill it.
    const entryPrice = await calculateTwap([...filledOrder.fillingOrders, fillingOrder.orderId], parseFloat(size))
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

    if (!partiallyFilledOrderExists) {
        partialPosition = await partialPositionsModel.create({
            orderId: filledOrder.orderId,
            partialPositionId: positionIdOfOrder,
            opener: filledOrder.opener,
            partialPositionType: filledOrder.positionType,       // "long" | "short"
            ticker: filledOrder.ticker,
            entryPrice: entryPrice,
            liquidationPrice: liquidationPrice,
            size: filledOrder.size,
            leverage: filledOrder.leverage,
            tp: 0,
            sl: 0,
            openingMargin: filledOrder.margin,
            fundingRate: filledOrder.margin, // 0% for a start.
            isComplete: false,
            percentageFilled: percentageFilled,
            time: timeOfPositionCreation
        })
    } else {
        partialPosition = await partialPositionsModel.updateOne(
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
            fillingOrders: [...filledOrder.fillingOrders, fillingOrder.orderId],
            sizeLeft: parseFloat((filledOrder.sizeLeft - fillingOrder.size).toFixed(4))
        }
    )

    if (!updateOrderEntry) {
        return [false, "Order entry could not be updated!"]
    }

    return [true, `Order ${filledOrder.orderId} filled!`]
}