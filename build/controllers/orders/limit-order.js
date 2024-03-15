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
const long_limit_order_1 = __importDefault(require("./long/long-limit-order"));
const short_limit_order_1 = __importDefault(require("./short/short-limit-order"));
/**
 * Takes an order, validated to be a limit order and processes it
 * either as a short limit or as a long limit order.
 *
 * @param order Order.
 * @returns Promise<[boolean, {}]> Return data.
 */
function processLimitOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        const { positionType } = order;
        let success = false, result = {};
        if (positionType == constants_1.LONG)
            [success, result] = yield (0, long_limit_order_1.default)(order);
        if (positionType == constants_1.SHORT)
            [success, result] = yield (0, short_limit_order_1.default)(order);
        return [success, result];
    });
}
exports.default = processLimitOrder;
