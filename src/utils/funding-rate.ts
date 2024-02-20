import fundingRatesModel from "../db/schema/funding-rates";
import positionsModel from "../db/schema/positions";
import { BINANCE_API, LONG, SHORT } from "./constants";

export default async function fundingRate(ticker: string) {
    const binanceData = await fetch(`${BINANCE_API}/api/v3/avgPrice?symbol=${ticker.toUpperCase()}USDT`)
    const data = await binanceData.json()
    const averageSpotPrice = parseFloat((data.price).toFixed(4))

    const lastMarketPrice = (await positionsModel.find({}).sort({ time: -1 }))[0].entryPrice

    // Source:
    // https://help.coinbase.com/en/international-exchange/funding/how-is-the-funding-rate-determined
    const fundingPerc = ((lastMarketPrice - averageSpotPrice) / averageSpotPrice) * 100

    // Perp price > spot price.
    // +ve funding rate.
    // Longs pay shorts.
    // Perp price < spot price.
    // -ve funding rate.
    // Shorts pay longs.
    await positionsModel.updateMany({ positionType: LONG, fundingRate: (-1 * fundingPerc) })
    await positionsModel.updateMany({ positionType: SHORT, fundingRate: (1 * fundingPerc) })

    await fundingRatesModel.updateOne({ ticker: ticker }, { timeOfLastFunding: new Date().getTime() })
}