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
const user_addreses_1 = __importDefault(require("../../db/schema/user-addreses"));
const constants_1 = require("../../utils/constants");
const increment_margin_1 = __importDefault(require("../../utils/increment-margin"));
function closePosition(positionId) {
    return __awaiter(this, void 0, void 0, function* () {
        const positionEntry = yield positions_1.default.findOne({ positionId: positionId });
        if (!positionEntry) {
            return [false, "Position not found."];
        }
        const { positionType, orderId, fundingRate } = positionEntry;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            return [false, "Order not found for position!"];
        }
        const { leverage, opener, price: initialPrice, size } = orderEntry;
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        const { user } = yield user_addreses_1.default.findOne({ tWallet: opener });
        // All are sold off as market orders.
        // If long position, sell as short.
        // If short, long.
        // More info at:
        // https://pippenguin.com/forex/learn-forex/calculate-profit-forex/#:~:text=To%20calculate%20forex%20profit%2C%20subtract,Trade%20Size%20%C3%97%20Pip%20Value.
        if (positionType == constants_1.LONG) {
            const totalProfit = (lastMarketPrice - initialPrice) * size * leverage;
            const profit = totalProfit + ((fundingRate / totalProfit) * 100);
            if (profit > 0) {
                // 💡 Increment user's margin.
                const incremented = yield (0, increment_margin_1.default)(user, profit);
                if (!incremented) {
                    return [false, "Could not increment margin with profit."];
                }
            }
        }
        // Math culled from:
        // https://leverage.trading/short-selling-calculator/
        if (positionType == constants_1.SHORT) {
            const totalProfit = (initialPrice - lastMarketPrice) * size * leverage;
            const profit = totalProfit + ((fundingRate / totalProfit) * 100);
            if (profit > 0) {
                // 💡 Increment user's margin.
                const incremented = yield (0, increment_margin_1.default)(user, profit);
                if (!incremented) {
                    return [false, "Could not increment margin with profit."];
                }
            }
        }
        const deletedPosition = yield positions_1.default.deleteOne({ positionId: positionId });
        if (!deletedPosition) {
            return [false, "Position could not be deleted."];
        }
        return [true, "Position closed."];
    });
}
exports.default = closePosition;
