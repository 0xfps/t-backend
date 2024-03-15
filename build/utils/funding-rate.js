"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const liquidate_positions_1 = require("../controllers/liquidator/liquidate-positions");
const funding_rates_1 = __importDefault(require("../db/schema/funding-rates"));
const orders_1 = __importDefault(require("../db/schema/orders"));
const positions_1 = __importDefault(require("../db/schema/positions"));
const constants_1 = require("./constants");
/**
 * Funding rates.
 *
 * 🚨🚨
 * Note: The math here was solely done by a developer and has not
 * been accepted by the team of devs. It is subject to changes.
 *
 * Funding rates are calculated from a position's size (margin x leverage)
 * and charged on the position's opening margin. Positions are created
 * with two properties:
 * `openingMargin`: The amount of money the order that opened the position was made with,
 * this is a static property.
 * `fundingRate`: This is a variable property, which at the start is equal to the `openingMargin`,
 * but, as funding rates are charged, the value of this property is incremented or decremented
 * respectively. This value is expected to not fall below a certain treshold, and when that
 * happens, the parent position is liquidated instantly.
 *
 * Using data from four sources, Bybit, Binance, OKX and Coinbase (future additions), the average
 * spot price for a particular ticker is retrieved and the average is taken. The percentage difference
 * between this average and our last market price is the funding percentage. The funding percentage
 * is used to calculate the funding rate from the position size and charged from or to the position's
 * `fundingRate`. Looking back at it, this is a not-so-good variable name.
 *
 * @param ticker Ticker.
 */
function fundingRate(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const bybitTicker = ticker.slice(1, ticker.length);
        // 💡 Add Binance, BitGet, Coinbase, and OKX APIs here.
        // 💡 Move this function to another file where it will be handled solely.
        // 💡 They're currently blocked by VPNs, so we'll use Axios and a proxy.
        const bybitData = yield fetch(`${constants_1.BYBIT_SPOT_PRICE_API}${bybitTicker.toUpperCase()}USD`);
        const data = yield bybitData.json();
        const averageSpotPrice = parseFloat((data.result.list[0].markPrice).toFixed(4));
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        // This can be positive or negative.
        // Source:
        // https://help.coinbase.com/en/international-exchange/funding/how-is-the-funding-rate-determined
        const fundingPerc = ((lastMarketPrice - averageSpotPrice) / averageSpotPrice) * 100;
        /**
         * if the perp price on Tradable is greater than the calculated average spot price, there is
         * a +ve funding rate. In this case, longs pay shorts.
         *
         * If the perp price on Tradable is lesser than the calculated average spot price, there is
         * a -ve funding rate. In this case, shorts pay longs.
         */
        const allPositions = yield positions_1.default.find({});
        if (allPositions.length > 0) {
            /**
             * This is the funding rate charging process.
             *
             * First, all positions on the exchange are retrieved, unordered and iterated upon.
             * Positions have openingMargins and fundingRates. If fundingRates drop below 80% or
             * 0.8 of the opening margin, i.e. LIQUIDATION_TRESHOLD, liquidate 💦.
             *
             * If funding rate is positive, LMP > ASP (refer to lines 50 - 54),
             * Longs are in unnecessary profit, tax longs, pay shorts. Deduct funding rate from
             * longs and increment the funding rates of shorts.
             *
             * If funding rate is negative, LMP < ASP (refer to lines 50 - 54),
             * Shorts are in unnecessary profit, tax shorts, pay longs. Deduct funding rate from
             * shorts and increment the funding rates of longs.
             *
             * This is a tiny math trick to ensure that no matter the sign of the funding percentage,
             * that the respective actions (addition or subtraction) are carried out on the respective
             * position types.
             *
             * If +ve, - longs, + shorts.
             * If -ve, + longs, - shorts.
             * Longs = -1 * fundingPerc.
             * Shorts = 1 * fundingPerc.
             */
            for (let i = 0; i < allPositions.length; i++) {
                const position = allPositions[i];
                const currentOpeningMargin = position.openingMargin;
                const currentFundingRate = position.fundingRate;
                const order = yield orders_1.default.findOne({ orderId: position.orderId });
                if (!order)
                    continue;
                const { leverage } = order;
                const positionSize = leverage * currentOpeningMargin;
                // This is the amount charged or added to position `fundingRate`s.
                // 🚨 The calculations are still undecided.
                let fundingMargin = 0;
                // +ve, +ve for longs and -ve for shorts so it can be decuctible from
                // longs and addable to shorts.
                if (fundingPerc > 0) {
                    fundingMargin = position.positionType == constants_1.LONG ?
                        (fundingPerc * positionSize * 0.01)
                        : (-1 * fundingPerc * positionSize * 0.01);
                }
                // -ve. -ve for longs and +ve for shorts so it can be decuctible from
                // shorts and addable to longs.
                if (fundingPerc < 0) {
                    fundingMargin = position.positionType == constants_1.LONG ?
                        (-1 * fundingPerc * positionSize * 0.01)
                        : (fundingPerc * positionSize * 0.01);
                }
                // If the fundingRate falls at or below this amount, liquidate the position.
                const treshold = constants_1.LIQUIDATION_THRESHOLD * currentOpeningMargin;
                if ((currentFundingRate - fundingMargin) <= treshold) {
                    yield (0, liquidate_positions_1.liquidatePositions)([position]);
                    continue;
                }
                /**
                 * Add funding margin to short fundingRate if positive, deduct if negative.
                 */
                if (position.positionType == constants_1.SHORT) {
                    if (fundingPerc > 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate + fundingMargin });
                    }
                    if (fundingPerc < 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate - fundingMargin });
                    }
                }
                /**
                 * Deduct funding margin from long fundingRate if positive, add if negative.
                 */
                if (position.positionType == constants_1.LONG) {
                    if (fundingPerc > 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate - fundingMargin });
                    }
                    if (fundingPerc < 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate + fundingMargin });
                    }
                }
            }
        }
        // Update the time of the last funding rate to the current time after all is complete.
        yield funding_rates_1.default.updateOne({ ticker: ticker }, { timeOfLastFunding: new Date().getTime() });
    });
}
exports.default = fundingRate;
