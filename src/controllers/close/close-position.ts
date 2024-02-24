import ordersModel from "../../db/schema/orders"
import positionsModel from "../../db/schema/positions"
import userAddressesModel from "../../db/schema/user-addreses"
import { LONG, SHORT } from "../../utils/constants"
import incrementMargin from "../../utils/increment-margin"

export default async function closePosition(positionId: string): Promise<[boolean, string]> {
    const positionEntry = await positionsModel.findOne({ positionId: positionId })

    if (!positionEntry) {
        return [false, "Position not found."]
    }

    const { positionType, orderId, fundingRate } = positionEntry

    const orderEntry = await ordersModel.findOne({ orderId: orderId })

    if (!orderEntry) {
        return [false, "Order not found for position!"]
    }

    const {
        leverage,
        opener,
        price: initialPrice,
        size
    } = orderEntry

    const lastMarketPrice: any = ((await positionsModel.find({}).sort({ time: -1 })) as any)[0].entryPrice

    const { user } = await userAddressesModel.findOne({ tWallet: opener })

    // All are sold off as market orders.
    // If long position, sell as short.
    // If short, long.
    // More info at:
    // https://pippenguin.com/forex/learn-forex/calculate-profit-forex/#:~:text=To%20calculate%20forex%20profit%2C%20subtract,Trade%20Size%20%C3%97%20Pip%20Value.
    if (positionType == LONG) {
        const totalProfit = (lastMarketPrice - initialPrice) * size * leverage
        const profit = totalProfit + ((fundingRate / totalProfit) * 100)

        if (profit > 0) {
            // 💡 Increment user's margin.
            const incremented = await incrementMargin(user, profit)
            if (!incremented) {
                return [false, "Could not increment margin with profit."]
            }
        }
    }

    // Math culled from:
    // https://leverage.trading/short-selling-calculator/
    if (positionType == SHORT) {
        const totalProfit = (initialPrice - lastMarketPrice) * size * leverage
        const profit = totalProfit + ((fundingRate / totalProfit) * 100)

        if (profit > 0) {
            // 💡 Increment user's margin.
            const incremented = await incrementMargin(user, profit)
            if (!incremented) {
                return [false, "Could not increment margin with profit."]
            }
        }
    }

    const deletedPosition = await positionsModel.deleteOne({ positionId: positionId })

    if (!deletedPosition) {
        return [false, "Position could not be deleted."]
    }

    return [true, "Position closed."]
}