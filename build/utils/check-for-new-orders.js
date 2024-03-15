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
const funding_rate_1 = __importDefault(require("./funding-rate"));
/**
 * Using the passed ticker, the code takes the last order
 * submitted for that ticker and evaluates the time of
 * submission. If the time is older than 5 minutes, then
 * funding rate is charged.
 *
 * @param ticker Ticker.
 */
function checkForNewOrders(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const allOrders = yield orders_1.default.find({}).sort({ time: "descending" });
        if (allOrders.length == 0)
            return;
        const lastOrder = allOrders[allOrders.length];
        if ((new Date().getTime() - lastOrder.time) > 300000) {
            yield (0, funding_rate_1.default)(ticker);
        }
    });
}
exports.default = checkForNewOrders;
