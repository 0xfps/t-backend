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
const funding_rates_1 = __importDefault(require("../db/schema/funding-rates"));
const positions_1 = __importDefault(require("../db/schema/positions"));
const constants_1 = require("./constants");
function fundingRate(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const binanceData = yield fetch(`${constants_1.BINANCE_API}/api/v3/avgPrice?symbol=${ticker.toUpperCase()}USDT`);
        const data = yield binanceData.json();
        const averageSpotPrice = parseFloat((data.price).toFixed(4));
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        // Source:
        // https://help.coinbase.com/en/international-exchange/funding/how-is-the-funding-rate-determined
        const fundingPerc = ((lastMarketPrice - averageSpotPrice) / averageSpotPrice) * 100;
        // Perp price > spot price.
        // +ve funding rate.
        // Longs pay shorts.
        // Perp price < spot price.
        // -ve funding rate.
        // Shorts pay longs.
        yield positions_1.default.updateMany({ positionType: constants_1.LONG, fundingRate: (-1 * fundingPerc) });
        yield positions_1.default.updateMany({ positionType: constants_1.SHORT, fundingRate: (1 * fundingPerc) });
        yield funding_rates_1.default.updateOne({ ticker: ticker }, { timeOfLastFunding: new Date().getTime() });
    });
}
exports.default = fundingRate;
