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
 * Long market order process.
 *
 * @param order Order.
 * @returns
 */
function processLongMarketOrder(order, isClosingOrder) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user } = yield user_addreses_1.default.findOne({ tWallet: order.opener });
        // Check in short orders to see if there are any orders matching within 20% slippage
        // of order price and order size.
        // User below is trying to sell as much as caller is trying to buy.
        const openShortMarketOrders = yield orders_1.default.find({
            positionType: constants_1.SHORT,
            // Can one fill a market order with a limit order?
            type: constants_1.MARKET,
            ticker: order.ticker.toLowerCase(),
            opener: { $ne: user },
            size: order.size,
            // Get short orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: (0, calculate_slippage_1.calculateSlippage)(constants_1.LONG, order.price), $lte: order.price },
            filled: false,
            deleted: false
        }).sort({ time: 1, price: -1 }); // Sort by first post first. 🚨 Possible bug.
        const openShortLimitOrders = yield orders_1.default.find({
            positionType: constants_1.SHORT,
            // Can one fill a market order with a limit order?
            type: constants_1.LIMIT,
            ticker: order.ticker.toLowerCase(),
            opener: { $ne: user },
            size: { $gte: order.size },
            // Get short orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: (0, calculate_slippage_1.calculateSlippage)(constants_1.LONG, order.price), $lte: order.price },
            filled: false,
            deleted: false
        }).sort({ time: 1, price: -1 }); // Sort by first post first. 🚨 Possible bug.
        const allOpenShortOrders = [...openShortLimitOrders, ...openShortMarketOrders];
        // If not short orders matching the user's market order are open, then
        // add data to database and then make order.
        const orderId = (0, get_unique_id_1.getUniqueId)(20);
        // 32, making it more unique and trackable, if desired.
        const aoriOrderId = `${orderId}-${(0, get_unique_id_1.getUniqueId)(20)}`;
        const time = new Date().getTime();
        const createdOrder = yield orders_1.default.create(Object.assign(Object.assign({ orderId,
            aoriOrderId }, order), { sizeLeft: order.size, filled: false, fillingOrders: [], deleted: false, time }));
        if (!createdOrder) {
            const response = {
                status: 400,
                msg: "Error creating order!"
            };
            return [false, response];
        }
        // Deduct margin if this is not a close order.
        if (!allOpenShortOrders || allOpenShortOrders.length == 0) {
            if (!isClosingOrder) {
                // 💡 Reduce user's margin.
                const decremented = yield (0, decrement_margin_1.default)(user, (order.margin + order.fee));
                return decremented ? [true, "Order Created!"] : [false, "Margin could not be deducted."];
            }
        }
        if (!isClosingOrder) {
            // 💡 Reduce user's margin.
            const decremented = yield (0, decrement_margin_1.default)(user, (order.margin + order.fee));
            if (!decremented) {
                return [false, "Margin could not be deducted."];
            }
        }
        /**
         * If an order is found on the short side, it is expected to fill the long
         * as it is market.
         * An open order is found.
         * An order is filled.
         * Two positions are created. One for long, one for short.
         */
        const [completed, reason] = yield (0, complete_order_1.default)(createdOrder, allOpenShortOrders, isClosingOrder, order.initialPriceBeforeClose);
        if (!completed) {
            return [false, { result: reason }];
        }
        return [true, { response: reason }];
    });
}
exports.default = processLongMarketOrder;
