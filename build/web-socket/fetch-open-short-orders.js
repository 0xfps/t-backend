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
const orders_1 = __importDefault(require("../db/schema/orders"));
const constants_1 = require("../utils/constants");
/**
 * Returns all opened short orders, limited to 15,
 * sorted by price, in ascending descending (highest to lowest).
 *
 * @param ticker Ticker.
 * @returns All open short orders.
 */
function fetchOpenShortOrders(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const allOpenShortOrders = yield orders_1.default.find({
            positionType: constants_1.SHORT,
            ticker: ticker,
            deleted: false,
            filled: false
        }).sort({ price: "descending" }).limit(15);
        if (allOpenShortOrders.length == 0) {
            return [];
        }
        return allOpenShortOrders;
    });
}
exports.default = fetchOpenShortOrders;
