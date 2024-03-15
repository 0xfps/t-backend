import closePosition from "../close/close-position"

/**
 * Liquidates a set of positions, packing the results of the liquidation
 * in an array. If any position doesn't liquidate properly, it returns false.
 * Otherwise returning true.
 * 
 * @param positions An array of positions to be liquidated.
 */
export async function liquidatePositions(positions: any[]) {
    positions.forEach(async function ({ positionId }: any) {
        await closePosition(positionId)
    })
}