import closePosition from "../close/close-position"

export async function liquidatePositions(positions: any[]) {
    positions.forEach(async function ({ positionId }: any) {
        await closePosition(positionId)
    })
}