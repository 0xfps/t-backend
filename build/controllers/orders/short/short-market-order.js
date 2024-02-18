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
const orders_1 = __importDefault(require("../../../db/schema/orders"));
const user_addreses_1 = __importDefault(require("../../../db/schema/user-addreses"));
const calculate_slippage_1 = require("../../../utils/calculate-slippage");
const constants_1 = require("../../../utils/constants");
const decrement_margin_1 = __importDefault(require("../../../utils/decrement-margin"));
const get_unique_id_1 = require("../../../utils/get-unique-id");
const complete_market_order_1 = __importDefault(require("../complete-order/complete-market-order"));
/**
 * Long market order process.
 *
 * @param order Order.
 * @returns
 */
function processShortMarketOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check in long orders to see if there are any orders matching within 20% slippage
        // of order price and order size.
        // User below is trying to sell as much as caller is trying to buy.
        const openLongOrders = yield orders_1.default.find({
            positionType: constants_1.LONG,
            // Can one fill a market order with a limit order?
            type: constants_1.MARKET,
            ticker: order.ticker.toLowerCase(),
            size: order.size,
            // Get long orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: order.price, $lte: (0, calculate_slippage_1.calculateSlippage)(constants_1.SHORT, order.price) },
            filled: false
        }).sort({ time: 1, price: -1 }); // Sort by first post first. 🚨 Possible bug.
        // If no long orders matching the user's market order are open, then only
        // add data to database because an order must be made to be taken in Aori.
        if (!openLongOrders || openLongOrders.length == 0) {
            const orderId = (0, get_unique_id_1.getUniqueId)(20);
            // 32, making it more unique and trackable, if desired.
            const aoriOrderId = `${orderId}-${(0, get_unique_id_1.getUniqueId)(20)}`;
            const time = new Date().getTime();
            const createdOrder = yield orders_1.default.create(Object.assign(Object.assign({ orderId,
                aoriOrderId }, order), { time }));
            if (!createdOrder) {
                const response = {
                    status: 400,
                    msg: "Error creating order!"
                };
                return [false, response];
            }
            return [true, "Order Created!"];
        }
        if (!openLongOrders || openLongOrders.length == 0) {
            return [true, "Order Created!"];
        }
        // 💡 Reduce user's margin.
        const { user } = yield user_addreses_1.default.findOne({ tWallet: opener });
        yield (0, decrement_margin_1.default)(user, order.margin * (10 ** 8));
        /**
         * If an order is found on the short side, it is expected to fill the long
         * as it is market.
         * An open order is found.
         * An order is filled.
         * Two positions are created. One for long, one for short.
         */
        const matchingOrder = openLongOrders[0];
        const [completed, reason] = yield (0, complete_market_order_1.default)(order, matchingOrder);
        if (!completed) {
            return [false, { result: reason }];
        }
        return [true, { respose: "OK!" }];
    });
}
exports.default = processShortMarketOrder;
