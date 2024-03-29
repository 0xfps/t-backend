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
const get_user_margin_balance_1 = __importDefault(require("../utils/get-user-margin-balance"));
const user_addreses_1 = __importDefault(require("../db/schema/user-addreses"));
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
        const { margin, opener, type, ticker, fee } = order;
        // Check if the contract exists for the desired ticker, e.g (tBTC).
        // Tickers are converted to lower case in the function.
        const [tickerExists,] = yield (0, get_ticker_contract_1.default)(ticker);
        // Do not proceed if market is insexistent.
        if (!tickerExists) {
            const response = {
                status: 404,
                msg: "Market inexistent!"
            };
            res.send(response);
            return;
        }
        // Get parent address to check if user's margin is higher than order margin.
        const parentAddressEntry = yield user_addreses_1.default.findOne({ tWallet: opener });
        if (!parentAddressEntry) {
            const response = {
                status: 404,
                msg: "Address not found!"
            };
            res.send(response);
            return;
        }
        const parentAddress = parentAddressEntry.user;
        // Check user's margin balance and compare it with margin.
        const marginBalance = yield (0, get_user_margin_balance_1.default)(parentAddress);
        if (marginBalance < (margin + fee)) {
            const response = {
                status: 400,
                msg: "Invalid request, margin and fees higher than margin balance!"
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
exports.default = openPositionController;
