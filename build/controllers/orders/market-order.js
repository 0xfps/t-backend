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
const constants_1 = require("../../utils/constants");
const long_market_order_1 = __importDefault(require("./long/long-market-order"));
const short_market_order_1 = __importDefault(require("./short/short-market-order"));
/**
 * This function processes market orders by delegating the
 * process to either one of two functions that process
 * market orders for long positions and market orders for
 * short positions.
 *
 * @param order Order.
 * @param isClosingOrder Boolean indicating if the order is being called from a close position.
 * @returns Promise<[boolean, {}]>
 */
function processMarketOrder(order, isClosingOrder = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const { positionType } = order;
        let success = false, result = {};
        if (positionType == constants_1.LONG)
            [success, result] = yield (0, long_market_order_1.default)(order, isClosingOrder);
        if (positionType == constants_1.SHORT)
            [success, result] = yield (0, short_market_order_1.default)(order, isClosingOrder);
        return [success, result];
    });
}
exports.default = processMarketOrder;
