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
const fetch_open_long_orders_1 = __importDefault(require("./fetch-open-long-orders"));
const fetch_open_short_orders_1 = __importDefault(require("./fetch-open-short-orders"));
/**
 * Returns open orders from the orderbook as an array.
 *
 * 💡
 * I think returning all orders from the orderbook will make the
 * code inefficient as the size of the orderbook grows. Consider
 * returning a slice of the orders. For example, returning the last
 * 10 - 15 respective orders in the orderbook.
 *
 * @param ticker Ticker
 * @returns Open long and short orders from the orderbook.
 */
function fetchOpenOrders(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const openLongs = yield (0, fetch_open_long_orders_1.default)(ticker);
        const openShorts = yield (0, fetch_open_short_orders_1.default)(ticker);
        return {
            longs: openLongs,
            shorts: openShorts
        };
    });
}
exports.default = fetchOpenOrders;
