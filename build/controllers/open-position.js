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
const constants_1 = require("../utils/constants");
const limit_order_1 = __importDefault(require("./orders/limit-order"));
const market_order_1 = __importDefault(require("./orders/market-order"));
const get_ticker_contract_1 = __importDefault(require("../utils/get-ticker-contract"));
/**
 * Opening a position is simply making a long or short position
 * in either limit or market types. The process of making
 * long and short orders are basically the same, just a tiny
 * bit different. While market orders iterate through existing
 * orders if any to find the perfect match between 10% slippage
 * before being added to the orders database if none is found,
 * limit orders are bound to be added to the database as they are
 * rarely filled.
 *
 * Thanks to Aori, the new docs involve the option to make limit orders,
 * who knows what can be done with that.
 *
 * Orders (`order`) are sent from the frontend, an order will contain
 * the following details:
 * positionType // "long" | "short"
 * type         // "limit" | "market"
 * opener
 * market       // BTC/USD
 * leverage
 * assetA
 * assetB
 * ticker       // tBTC.
 * size
 * price
 * time
 *
 * Orders are passed to specific functions based on their `type` and `positionType`.
 * Orders are sent to this endpoint by appending them to the `order` key in the
 * JSON body object like:
 *
 * body: {
 *     order: {
 *         ...
 *     }
 * }
 */
function openPositionController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { order } = req.body;
        // OrderID and order time are calculated here.
        const { type, ticker } = order;
        // Check if the contract exists for the desired ticker, e.g (tBTC).
        // Tickers are converted to lower case in the function.
        const [tickerExists,] = yield (0, get_ticker_contract_1.default)(order.ticker);
        // Do not proceed if market is insexistent.
        if (!tickerExists) {
            const response = {
                status: 404,
                msg: "Market inexistent!"
            };
            res.send(response);
            return;
        }
        let success = false, result = {};
        if (type == constants_1.LIMIT)
            [success, result] = yield (0, limit_order_1.default)(order);
        if (type == constants_1.MARKET)
            [success, result] = yield (0, market_order_1.default)(order);
        if (!success) {
            // Return errors.
            console.log("Result ::", result);
        }
        // Return success.
    });
}
exports.default = openPositionController;
