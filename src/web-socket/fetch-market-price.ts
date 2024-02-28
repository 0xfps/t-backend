import positionsModel from "../db/schema/positions"
import { BYBIT_SPOT_PRICE_API } from "../utils/constants"

export default async function fetchMarketPrice(ticker: string) {
    const positions = await positionsModel.find({ ticker: ticker }).sort({ time: "descending" })

    ticker = ticker.slice(1, ticker.length)

    console.log(ticker)

    if (positions.length == 0) {
        const bybitSymbol = `${ticker}usd`.toUpperCase()
        const req = await fetch(`${BYBIT_SPOT_PRICE_API}${bybitSymbol}`)
        const res = await req.json()
        if (res.retMsg.toLowerCase() == "ok") {
            const marketPrice = res.result.list[0].lastPrice
            return parseFloat(marketPrice)
        }
    }

    const marketPrice = positions[0].entryPrice
    return parseFloat(marketPrice)
}