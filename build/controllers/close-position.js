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
const market_order_1 = __importDefault(require("./orders/market-order"));
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
        }
        const { positionType, orderId } = positionEntry;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            const response = {
                status: 404,
                msg: "Order not found for position!"
            };
            res.send(response);
        }
        const { type, opener, market, margin, leverage, assetA, assetB, ticker, size } = orderEntry;
        const lastMarketPrice = (yield positions_1.default.find({}).sort({ time: -1 })).entryPrice;
        let success = false, result = {};
        // All are sold off as market orders.
        // If long position, sell as short.
        // If short, long.
        if (positionType == constants_1.LONG) {
            const newOrder = {
                positionType: constants_1.SHORT,
                type: constants_1.MARKET,
                opener: opener,
                market: market,
                leverage: leverage,
                margin: margin,
                assetA: assetA,
                assetB: assetB,
                ticker: ticker,
                size: size,
                price: lastMarketPrice
            }; // Don't remove this ";".
            [success, result] = yield (0, market_order_1.default)(newOrder);
        }
        if (positionType == constants_1.SHORT) {
            const newOrder = {
                positionType: constants_1.LONG,
                type: constants_1.MARKET,
                opener: opener,
                market: market,
                leverage: leverage,
                margin: margin,
                assetA: assetA,
                assetB: assetB,
                ticker: ticker,
                size: size,
                price: lastMarketPrice
            }; // Don't remove this ";".
            [success, result] = yield (0, market_order_1.default)(newOrder);
        }
        if (!success) {
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
            data: result
        };
        res.send(response);
    });
}
exports.default = closePositionController;
