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
exports.getTickerInformationController = void 0;
const get_ticker_contract_1 = __importDefault(require("../utils/get-ticker-contract"));
const positions_1 = __importDefault(require("../db/schema/positions"));
function getTickerInformationController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ticker } = req.params;
        // Check if the contract exists for the desired ticker, e.g(tBTC).
        // Tickers are converted to lower case in the function.
        const [tickerExists,] = yield (0, get_ticker_contract_1.default)(ticker);
        // Do not proceed if market is insexistent.
        if (!tickerExists) {
            const response = {
                status: 404,
                msg: "Market inexistent!"
            };
            res.send(response);
            return;
        }
        const data = {
            change24h: 0,
            openInterest: 0,
            volume24h: 0,
            trades24h: 0,
            // [high, low]
            highLow24h: []
        };
        const h24 = 1000 * 60 * 60 * 24;
        const tickersPositions = yield positions_1.default.find({ ticker: ticker });
        if (tickersPositions.length == 0) {
            const response = {
                status: 200,
                msg: "OK",
                data: data
            };
            res.send(response);
            return;
        }
        // Earliest to current.
        const tickerChange24h = yield positions_1.default.find({ ticker: ticker, time: { $lte: new Date().getTime(), $gte: (new Date().getTime() - h24) } }).sort({ time: "ascending" });
        const latestPrice = tickerChange24h[tickerChange24h.length - 1].entryPrice;
        const earliestPrice = tickerChange24h[0].entryPrice;
        const change24h = ((latestPrice - earliestPrice) / earliestPrice) * 100;
        const openInterest = tickersPositions.reduce(function (cV, position) {
            return cV + (position.size * position.openingMargin);
        }, 0);
        const volume24h = tickerChange24h.reduce(function (cV, position) {
            return cV + (position.size * position.openingMargin);
        }, 0);
        const trades24h = tickerChange24h.length;
        const highLow24h = [latestPrice, earliestPrice];
        const response = {
            status: 200,
            msg: "OK",
            data: {
                change24h: change24h,
                openInterest: openInterest,
                volume24h: volume24h,
                trades24h: trades24h,
                // [high, low]
                highLow24h: highLow24h
            }
        };
        res.send(response);
        return;
    });
}
exports.getTickerInformationController = getTickerInformationController;
