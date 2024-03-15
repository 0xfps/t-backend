import ordersModel from "../../db/schema/orders"
import positionsModel from "../../db/schema/positions"
import { LONG, Order, SHORT } from "../../utils/constants"
import processLongMarketOrder from "../orders/long/long-market-order"
import processShortMarketOrder from "../orders/short/short-market-order"

/**
 * Closes position identified by `positionId`.
 * 
 * @param positionId Position id to be closed.
 * @returns Promise<[boolean, string]>
 */
export default async function closePosition(positionId: string): Promise<[boolean, string]> {
    const positionEntry = await positionsModel.findOne({ positionId: positionId })

    if (!positionEntry) {
        return [false, "Position not found."]
    }

    const { orderId } = positionEntry

    const orderEntry = await ordersModel.findOne({ orderId: orderId })

    if (!orderEntry) {
        return [false, "Order not found for position!"]
    }

    const lastMarketPrice: any = ((await positionsModel.find({}).sort({ time: -1 })) as any)[0].entryPrice

    const {
        positionType: orderPositionType,
        type,
        opener,
        market,
        leverage,
        margin,
        fee,
        ticker,
        size,
        price: initialPrice
    }: Order = orderEntry

    const newOrder: Order = {
        positionType: orderPositionType,
        type,
        opener,
        market,
        leverage,
        margin,
        fee,
        ticker,
        size,
        price: lastMarketPrice,
        marketPrice: lastMarketPrice,
        initialPriceBeforeClose: initialPrice
    }

    // All are sold off as market orders.
    // If long position, sell as short.
    // If short, long.
    let success: any, reason: any

    if (orderPositionType == LONG) {
        [success, reason] = await processShortMarketOrder(newOrder, true)
    }

    if (orderPositionType == SHORT) {
        [success, reason] = await processLongMarketOrder(newOrder, true)
    }

    if (!success) {
        return [success, reason.response]
    }

    const deletedPosition = await positionsModel.deleteOne({ positionId: positionId })

    if (!deletedPosition) {
        return [false, "Position could not be deleted."]
    }

    return [true, "Position closed."]
}