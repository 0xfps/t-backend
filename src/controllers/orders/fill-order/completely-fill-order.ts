import ordersModel from "../../../db/schema/orders"
import partialPositionsModel from "../../../db/schema/partial-positions"
import positionsModel from "../../../db/schema/positions"
import userAddressesModel from "../../../db/schema/user-addreses"
import calculateLiquidationPrice from "../../../utils/calculate-liquidation-price"
import { calculateMarginRatio } from "../../../utils/calculate-margin-ratio"
import { LONG, SHORT } from "../../../utils/constants"
import { getUniqueId } from "../../../utils/get-unique-id"
import incrementMargin from "../../../utils/increment-margin"
import { liquidatePositions } from "../../liquidator/liquidate-positions"
import TPxSL from "../../tp-sl/tp-sl"

// Fills `filledOrder` completely and closes the DB.
// The focus is on `filledOrder`, not `fillingOrder`.
export default async function completelyFillOrder(filledOrder: any, fillingOrder: any, isClosingOrder = false, usersEntryMarketPrice?: number): Promise<[boolean, string]> {
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

    // Run Take profit and stop loss.
    // Stop loss first.
    // Take profit next.
    await TPxSL(entryPrice)

    const { user } = await userAddressesModel.findOne({ tWallet: filledOrder.opener })

    // Create position if the order is not being closed.
    if (!isClosingOrder) {
        const createdPosition = await positionsModel.create({
            orderId: filledOrder.orderId,
            positionId: positionIdOfOrder,
            opener: filledOrder.opener,
            positionType: filledOrder.positionType,       // "long" | "short"
            ticker: filledOrder.ticker,
            entryPrice: entryPrice,
            liquidationPrice: liquidationPrice,
            tp: 0,
            sl: 0,
            openingMargin: filledOrder.margin,
            fundingRate: filledOrder.margin, // 0% for a start.
            time: timeOfPositionCreation
        })

        if (!createdPosition) {
            return [false, "Position could not be created!"]
        }
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

    // Take profits or losses.
    if (isClosingOrder) {
        const currentMarketPrice = entryPrice
        const usersEntryPrice = usersEntryMarketPrice!

        const buyValue = usersEntryPrice * filledOrder.size
        const saleValue = currentMarketPrice * filledOrder.size

        // If position type is a long, the users initial position was a short,
        // so the user longs to close.
        // We run the opening price size - sale price size
        // 
        // If position type is a short, the users initial position was a long,
        // so the user shorts to close.
        // We run the sale price size - opening price size
        let profit = 0

        if (filledOrder.positionType == LONG) {
            profit = (buyValue - saleValue) / filledOrder.leverage
        } else {
            profit = (saleValue - buyValue) / filledOrder.leverage
        }

        await incrementMargin(user, profit)
    }

    return [true, `Order ${filledOrder.orderId} filled!`]
}