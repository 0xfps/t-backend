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
const positions_1 = __importDefault(require("../../db/schema/positions"));
const constants_1 = require("../../utils/constants");
const long_market_order_1 = __importDefault(require("../orders/long/long-market-order"));
const short_market_order_1 = __importDefault(require("../orders/short/short-market-order"));
/**
 * Closes position identified by `positionId`.
 *
 * @param positionId Position id to be closed.
 * @returns Promise<[boolean, string]>
 */
function closePosition(positionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const positionEntry = yield positions_1.default.findOne({ positionId: positionId });
        if (!positionEntry) {
            return [false, "Position not found."];
        }
        const { orderId } = positionEntry;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            return [false, "Order not found for position!"];
        }
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        const { positionType: orderPositionType, type, opener, market, leverage, margin, fee, ticker, size, price: initialPrice } = orderEntry;
        const newOrder = {
            positionType: orderPositionType,
            type,
            opener,
            market,
            leverage,
            margin,
            fee,
            ticker,
            size,
            price: lastMarketPrice,
            marketPrice: lastMarketPrice,
            initialPriceBeforeClose: initialPrice
        };
        // All are sold off as market orders.
        // If long position, sell as short.
        // If short, long.
        let success, reason;
        if (orderPositionType == constants_1.LONG) {
            [success, reason] = yield (0, short_market_order_1.default)(newOrder, true);
        }
        if (orderPositionType == constants_1.SHORT) {
            [success, reason] = yield (0, long_market_order_1.default)(newOrder, true);
        }
        if (!success) {
            return [success, reason.response];
        }
        const deletedPosition = yield positions_1.default.deleteOne({ positionId: positionId });
        if (!deletedPosition) {
            return [false, "Position could not be deleted."];
        }
        return [true, "Position closed."];
    });
}
exports.default = closePosition;
