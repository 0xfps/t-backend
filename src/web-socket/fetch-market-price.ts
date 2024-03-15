import positionsModel from "../db/schema/positions"

/**
 * Returns the entry price of the last opened position.
 * Last opened position can be retrieved by sorting
 * the returned positions' times in a descending order
 * (latest to earliest) and taking the first entry of the array.
 * 
 * @param ticker Ticker.
 * @returns Entry price of last opened position.
 */
export default async function fetchMarketPrice(ticker: string) {
    
    const positions = await positionsModel.find({ ticker: ticker }).sort({ time: "descending" })

    if (positions.length == 0) {
        return 0
    }

    const marketPrice = positions[0].entryPrice
    return parseFloat(marketPrice)
}