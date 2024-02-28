import positionsModel from "../db/schema/positions"

export default async function fetchMarketPrice(ticker: string) {
    const positions = await positionsModel.find({ ticker: ticker }).sort({ time: "descending" })

    ticker = ticker.slice(1, ticker.length)

    if (positions.length == 0) {
        return 0
    }

    const marketPrice = positions[0].entryPrice
    return parseFloat(marketPrice)
}