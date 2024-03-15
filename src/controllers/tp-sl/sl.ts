import positionsModel from "../../db/schema/positions";
import closePosition from "../close/close-position";

/**
 * Stops loss by closing a position once the "sl" entry of the
 * position strikes `price`.
 * 
 * @param price Price.
 */
export default async function SL(price: number) {
    const allSLs = await positionsModel.find({ sl: { $lte: price } })

    if (allSLs.length > 0) {
        const tpRequests = allSLs.map(async function (tpPosition: any) {
            const [success,] = await closePosition(tpPosition.positionId)
            return success
        })

        await Promise.all(tpRequests)
    }
}