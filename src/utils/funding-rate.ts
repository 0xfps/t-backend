import { liquidatePositions } from "../controllers/liquidator/liquidate-positions";
import fundingRatesModel from "../db/schema/funding-rates";
import ordersModel from "../db/schema/orders";
import positionsModel from "../db/schema/positions";
import { BINANCE_API, BYBIT_SPOT_PRICE_API, LIQUIDATION_THRESHOLD, LONG, SHORT } from "./constants";

export default async function fundingRate(ticker: string) {
    const bybitTicker = ticker.slice(1, ticker.length)

    // 💡 Add Binance, BitGet, Coinbase, and OKX APIs here.
    // 💡 Move this function to another file where it will be handled solely.
    // 💡 They're currently blocked by VPNs, so we'll use Axios and a proxy.
    const bybitData = await fetch(`${BYBIT_SPOT_PRICE_API}${bybitTicker.toUpperCase()}USD`)
    const data = await bybitData.json()
    const averageSpotPrice = parseFloat((data.result.list[0].markPrice).toFixed(4))

    const lastMarketPrice = (await positionsModel.find({}).sort({ time: -1 }))[0].entryPrice

    // This can be positive or negative.
    // Source:
    // https://help.coinbase.com/en/international-exchange/funding/how-is-the-funding-rate-determined
    const fundingPerc = ((lastMarketPrice - averageSpotPrice) / averageSpotPrice) * 100

    // Perp price > spot price.
    // +ve funding rate.
    // Longs pay shorts.
    // Perp price < spot price.
    // -ve funding rate.
    // Shorts pay longs.

    const allPositions = await positionsModel.find({})
    if (allPositions.length > 0) {
        // Positions have openingMargins and fundingRates.
        // If fundingRates drop below 80% or 0.8 of the opening margin, 
        // i.e. LIQUIDATION_TRESHOLD, liquidate 💦.
        // Then deduct margin and set funding rate as the initial order price.
        // Initially, fundingRates in positions is the initial order margin.
        // If funding rate is positive, LMP > ASP (refer to lines 10 - 17),
        // Longs are in unnecessary profit, tax longs, pay shorts.
        // If funding rate is negative, LMP < ASP (refer to lines 10 - 17),
        // Shorts are in unnecessary profit, tax shorts, pay longs.
        // Positive funding rate.
        // If +ve, - longs, + shorts.
        // If -ve, + longs, - shorts.
        // Longs = -1 * fundingPerc.
        // Shorts = 1 * fundingPerc.
        for (let i = 0; i < allPositions.length; i++) {
            const position = allPositions[i]

            const currentOpeningMargin = position.openingMargin
            const currentFundingRate = position.fundingRate

            const order = (await ordersModel.findOne({ orderId: position.orderId }))
            const { size, leverage } = order

            const positionSize = size * leverage * position.openingMargin

            let fundingMargin = 0

            // +ve, +ve for longs and -ve for shorts so it can be decuctible from
            // longs and addable to shorts.
            if (fundingPerc > 0) {
                fundingMargin = position.positionType == LONG ?
                    (1 * fundingPerc * positionSize * 0.01)
                    : (-1 * fundingPerc * positionSize * 0.01)
            }

            // -ve. -ve for longs and +ve for shorts so it can be decuctible from
            // shorts and addable to longs.
            if (fundingPerc < 0) {
                fundingMargin = position.positionType == LONG ?
                    (-1 * fundingPerc * positionSize * 0.01)
                    : (1 * fundingPerc * positionSize * 0.01)
            }

            const treshold = LIQUIDATION_THRESHOLD * currentOpeningMargin

            if ((currentFundingRate - fundingMargin) <= treshold) {
                await liquidatePositions([position])
                continue
            }

            if (position.positionType == SHORT) {
                if (fundingPerc > 0) {
                    await positionsModel.updateOne(
                        { positionId: position.positionId },
                        { fundingRate: currentFundingRate + fundingMargin }
                    )
                }
                if (fundingPerc < 0) {
                    await positionsModel.updateOne(
                        { positionId: position.positionId },
                        { fundingRate: currentFundingRate - fundingMargin }
                    )
                }
            }

            if (position.positionType == LONG) {
                if (fundingPerc > 0) {
                    await positionsModel.updateOne(
                        { positionId: position.positionId },
                        { fundingRate: currentFundingRate - fundingMargin }
                    )
                }
                if (fundingPerc < 0) {
                    await positionsModel.updateOne(
                        { positionId: position.positionId },
                        { fundingRate: currentFundingRate + fundingMargin }
                    )
                }
            }
        }
    }

    await fundingRatesModel.updateOne({ ticker: ticker }, { timeOfLastFunding: new Date().getTime() })
}