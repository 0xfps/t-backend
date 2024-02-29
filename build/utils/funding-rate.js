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
const positions_1 = __importDefault(require("../db/schema/positions"));
const constants_1 = require("./constants");
function fundingRate(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        ticker = ticker.slice(1, ticker.length);
        const binanceData = yield fetch(`${constants_1.BYBIT_SPOT_PRICE_API}${ticker.toUpperCase()}USD`);
        const data = yield binanceData.json();
        const averageSpotPrice = parseFloat((data.result.list[0].markPrice).toFixed(4));
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        // This can be positive or negative.
        // Source:
        // https://help.coinbase.com/en/international-exchange/funding/how-is-the-funding-rate-determined
        const fundingPerc = ((lastMarketPrice - averageSpotPrice) / averageSpotPrice) * 100;
        // Perp price > spot price.
        // +ve funding rate.
        // Longs pay shorts.
        // Perp price < spot price.
        // -ve funding rate.
        // Shorts pay longs.
        const allPositions = yield positions_1.default.find({});
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
                const position = allPositions[i];
                const currentOpeningMargin = position.openingMargin;
                const currentFundingRate = position.fundingRate;
                let fundingMargin = 0;
                // +ve, +ve for longs and -ve for shorts so it can be decuctible from
                // longs and addable to shorts.
                if (fundingPerc > 0) {
                    fundingMargin = position.positionType == constants_1.LONG ?
                        (1 * fundingPerc * currentOpeningMargin * 0.01)
                        : (-1 * fundingPerc * currentOpeningMargin * 0.01);
                }
                // -ve. -ve for longs and +ve for shorts so it can be decuctible from
                // shorts and addable to longs.
                if (fundingPerc < 0) {
                    fundingMargin = position.positionType == constants_1.LONG ?
                        (-1 * fundingPerc * currentOpeningMargin * 0.01)
                        : (1 * fundingPerc * currentOpeningMargin * 0.01);
                }
                const treshold = constants_1.LIQUIDATION_THRESHOLD * currentOpeningMargin;
                if ((currentFundingRate - fundingMargin) <= treshold) {
                    yield (0, liquidate_positions_1.liquidatePositions)([position]);
                    continue;
                }
                if (position.positionType == constants_1.SHORT) {
                    if (fundingPerc > 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate + fundingMargin });
                    }
                    if (fundingPerc < 0) {
                        yield positions_1.default.updateOne({ positionId: position.positionId }, { fundingRate: currentFundingRate - fundingMargin });
                    }
                }
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
        yield funding_rates_1.default.updateOne({ ticker: ticker }, { timeOfLastFunding: new Date().getTime() });
    });
}
exports.default = fundingRate;
