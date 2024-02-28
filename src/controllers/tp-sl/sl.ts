import positionsModel from "../../db/schema/positions";
import closePosition from "../close/close-position";

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