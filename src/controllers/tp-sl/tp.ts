import positionsModel from "../../db/schema/positions";
import closePosition from "../close/close-position";

/**
 * Takes profit by closing a position once the "tp" entry of the
 * position strikes `price`.
 * 
 * @param price Price.
 */
export default async function TP(price: number) {
    const allTPs = await positionsModel.find({ tp: { $gte: price } })

    if (allTPs.length > 0) {
        const tpRequests = allTPs.map(async function (tpPosition: any) {
            const [success,] = await closePosition(tpPosition.positionId)
            return success
        })

        await Promise.all(tpRequests)
    }
}