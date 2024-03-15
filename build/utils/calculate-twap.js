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
/**
 * Calculates the Time Weighted Average Price for an array of orders and a particular
 * size. The size comes from the parent order being filled and the orderIds are the
 * filling orders. Remember that?
 *
 * TWAP =       E(FillingOrder(n).size * FillingOrder(n).price)
 *          ------------------------------------------------------
 *                             FilledOrder.size
 *
 * @param orderIds  An array of orders.
 * @param size      Size of the filled order.
 * @returns Promise<number>
 */
function calculateTwap(orderIds, size) {
    return __awaiter(this, void 0, void 0, function* () {
        let TWP = 0;
        const twps = orderIds.map(function (orderId) {
            return __awaiter(this, void 0, void 0, function* () {
                const { size, price } = yield orders_1.default.findOne({ orderId: orderId });
                return parseFloat(size) * parseFloat(price);
            });
        });
        const TWPs = yield Promise.all(twps);
        TWPs.forEach(function (thisTWP) {
            TWP += parseFloat(thisTWP);
        });
        return parseFloat((TWP / size).toFixed(4));
    });
}
exports.default = calculateTwap;
