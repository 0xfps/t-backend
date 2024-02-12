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
const calculate_slippage_1 = require("../../../utils/calculate-slippage");
const constants_1 = require("../../../utils/constants");
const get_unique_id_1 = require("../../../utils/get-unique-id");
function processLongLimitOrder(order) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check in short orders to see if there are any orders matching within 20% slippage
        // of order price and order size.
        // User below is trying to sell as much as caller is trying to buy.
        const openShortOrders = yield orders_1.default.find({
            positionType: constants_1.SHORT,
            // Can one fill a market order with a limit order?
            type: constants_1.LIMIT,
            ticker: order.ticker.toLowerCase(),
            size: order.size,
            // Get short orders where the selling price is within 20% slippage of the
            // buying price of the market and the selling price.
            price: { $gte: (0, calculate_slippage_1.calculateSlippage)(constants_1.LONG, order.price, 20), $lte: order.price }
        }).sort({ time: -1, price: -1 }); // Sort by most recent first. 🚨 Possible bug.
        // If not short orders matching the user's market order are open, then
        // add data to database and then make order.
        if (!openShortOrders || openShortOrders.length == 0) {
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
            // Make order via Aori.
        }
        // If found, make order via Aori, then take order using what's found.
        // Make return match.
        // 🚨🚨🚨🚨🚨🚨🚨🚨
        return [false, {}];
    });
}
exports.default = processLongLimitOrder;
