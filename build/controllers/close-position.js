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
const constants_1 = require("../utils/constants");
const orders_1 = __importDefault(require("../db/schema/orders"));
const user_addreses_1 = __importDefault(require("../db/schema/user-addreses"));
const increment_margin_1 = __importDefault(require("../utils/increment-margin"));
/**
 * Closes a position specified by the positionId.
 *
 * @param req Request.
 * @param res Response.
 */
function closePositionController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { positionId } = req.body;
        // I think there maybe should be some sort of authorization
        // to validate the call to this endpoint in order to avoid
        // wrong calls.
        const positionEntry = yield positions_1.default.findOne({ positionId: positionId });
        if (!positionEntry) {
            const response = {
                status: 404,
                msg: "Position not found!"
            };
            res.send(response);
            return;
        }
        const { positionType, orderId, fundingRate } = positionEntry;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            const response = {
                status: 404,
                msg: "Order not found for position!"
            };
            res.send(response);
            return;
        }
        const { margin, leverage, opener, price: initialPrice, size } = orderEntry;
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 }))[0].entryPrice;
        let success = false, result = {};
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
                    const response = {
                        status: 400,
                        msg: "Could not increment margin with profit."
                    };
                    res.send(response);
                    return;
                }
            }
        }
        // Math culled from:
        // https://leverage.trading/short-selling-calculator/
        if (positionType == constants_1.SHORT) {
            const totalProfit = (initialPrice - lastMarketPrice) * size * leverage;
            const profit = totalProfit + ((fundingRate / totalProfit) * 100);
            // 💡 Increment user's margin.
            const incremented = yield (0, increment_margin_1.default)(user, profit);
            if (!incremented) {
                const response = {
                    status: 400,
                    msg: "Could not increment margin with profit."
                };
                res.send(response);
                return;
            }
        }
        const deletedPosition = yield positions_1.default.deleteOne({ positionId: positionId });
        if (!success || !deletedPosition) {
            const response = {
                status: 400,
                msg: "Error"
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: "OK!",
            data: {
                result: "Good."
            }
        };
        res.send(response);
    });
}
exports.default = closePositionController;
