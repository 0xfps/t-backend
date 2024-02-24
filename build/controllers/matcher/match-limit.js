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
const orders_1 = __importDefault(require("../../db/schema/orders"));
const calculate_slippage_1 = require("../../utils/calculate-slippage");
const constants_1 = require("../../utils/constants");
const complete_order_1 = __importDefault(require("../orders/complete-order/complete-order"));
function match(longLimitOrders, shortLimitOrders) {
    return __awaiter(this, void 0, void 0, function* () {
        longLimitOrders.forEach(function (longLimitOrder) {
            return __awaiter(this, void 0, void 0, function* () {
                // Check in short orders to see if there are any orders matching within 20% slippage
                // of order price and order size.
                // User below is trying to sell as much as caller is trying to buy.
                const openShortOrders = yield orders_1.default.find({
                    positionType: constants_1.SHORT,
                    // Can one fill a market order with a limit order?
                    type: constants_1.LIMIT,
                    ticker: longLimitOrder.ticker.toLowerCase(),
                    // No need for order size, it's an aggregation.
                    // Get short orders where the selling price is within 20% slippage of the
                    // buying price of the market and the selling price.
                    price: { $gte: (0, calculate_slippage_1.calculateSlippage)(constants_1.LONG, longLimitOrder.price), $lte: longLimitOrder.price },
                    filled: false
                }).sort({ time: 1, price: 1 }); // Sort by first post first. 🚨 Possible bug.
                if (openShortOrders.length > 0) {
                    yield (0, complete_order_1.default)(longLimitOrder, openShortOrders);
                }
            });
        });
    });
}
exports.default = match;
