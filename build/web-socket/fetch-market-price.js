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
/**
 * Returns the entry price of the last opened position.
 * Last opened position can be retrieved by sorting
 * the returned positions' times in a descending order
 * (latest to earliest) and taking the first entry of the array.
 *
 * @param ticker Ticker.
 * @returns Entry price of last opened position.
 */
function fetchMarketPrice(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const positions = yield positions_1.default.find({ ticker: ticker }).sort({ time: "descending" });
        if (positions.length == 0) {
            return 0;
        }
        const marketPrice = positions[0].entryPrice;
        return parseFloat(marketPrice);
    });
}
exports.default = fetchMarketPrice;
