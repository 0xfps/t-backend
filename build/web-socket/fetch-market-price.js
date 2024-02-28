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
const positions_1 = __importDefault(require("../db/schema/positions"));
const constants_1 = require("../utils/constants");
function fetchMarketPrice(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const positions = yield positions_1.default.find({ ticker: ticker }).sort({ time: "descending" });
        if (positions.length == 0) {
            const bybitSymbol = `${ticker}usd`.toUpperCase();
            const req = yield fetch(`${constants_1.BYBIT_SPOT_PRICE_API}${bybitSymbol}`);
            const res = yield req.json();
            if (res.retMsg.toLowerCase() == "ok") {
                const marketPrice = res.result.list[0].lastPrice;
                return parseFloat(marketPrice);
            }
        }
        const marketPrice = positions[0].entryPrice;
        return parseFloat(marketPrice);
    });
}
exports.default = fetchMarketPrice;
