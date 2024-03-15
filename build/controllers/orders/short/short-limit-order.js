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
const complete_order_1 = __importDefault(require("../complete-order/complete-order"));
/**
 * Processes a short limit order.
 *
 * @param order Order
 * @returns Promise<[boolean, {}]>
 */
function processShortLimitOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user } = yield user_addreses_1.default.findOne({ tWallet: order.opener });
        // Check in long orders to see if there are any orders matching within 20% slippage
        // of order price and order size.
        // User below is trying to sell as much as caller is trying to buy.
        const openLongLimitOrders = yield orders_1.default.find({
            positionType: constants_1.LONG,
            // Can one fill a market order with a limit order?
            type: constants_1.LIMIT,
            ticker: order.ticker.toLowerCase(),
            opener: { $ne: user },
            // No need for order size, it's an aggregation.
            // Get long orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: order.price, $lte: (0, calculate_slippage_1.calculateSlippage)(constants_1.SHORT, order.price) },
            filled: false,
            deleted: false
        }).sort({ time: 1, price: -1 });
        const openLongMarketOrders = yield orders_1.default.find({
            positionType: constants_1.LONG,
            // Can one fill a market order with a limit order?
            type: constants_1.MARKET,
            ticker: order.ticker.toLowerCase(),
            opener: { $ne: user },
            size: { $lte: order.size },
            // No need for order size, it's an aggregation.
            // Get long orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: order.price, $lte: (0, calculate_slippage_1.calculateSlippage)(constants_1.SHORT, order.price) },
            filled: false,
            deleted: false
        }).sort({ time: 1, price: -1 });
        const allOpenLongOrders = [...openLongLimitOrders, ...openLongMarketOrders];
        // Short limit price must be >= market price.
        if (order.price < order.marketPrice)
            return [false, "Short limit price cannot be less than market price."];
        // If no long orders matching the user's market order are open, then only
        // add data to database because an order must be made to be taken in Aori.
        const orderId = (0, get_unique_id_1.getUniqueId)(20);
        const time = new Date().getTime();
        const createdOrder = yield orders_1.default.create(Object.assign(Object.assign({ orderId }, order), { sizeLeft: order.size, filled: false, fillingOrders: [], deleted: false, time }));
        if (!createdOrder) {
            const response = {
                status: 400,
                msg: "Error creating order!"
            };
            return [false, response];
        }
        if (!allOpenLongOrders || allOpenLongOrders.length == 0) {
            // 💡 Reduce user's margin.
            const decremented = yield (0, decrement_margin_1.default)(user, (order.margin + order.fee));
            return decremented ? [true, "Order Created!"] : [false, "Margin could not be deducted."];
        }
        // 💡 Reduce user's margin.
        const decremented = yield (0, decrement_margin_1.default)(user, (order.margin + order.fee));
        if (!decremented) {
            return [false, "Margin could not be deducted."];
        }
        const [completed, reason] = yield (0, complete_order_1.default)(createdOrder, allOpenLongOrders);
        return [completed, { result: reason }];
    });
}
exports.default = processShortLimitOrder;
