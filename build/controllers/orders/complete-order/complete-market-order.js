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
const positions_1 = __importDefault(require("../../../db/schema/positions"));
const calculate_liquidation_price_1 = __importDefault(require("../../../utils/calculate-liquidation-price"));
const calculate_margin_ratio_1 = require("../../../utils/calculate-margin-ratio");
const get_unique_id_1 = require("../../../utils/get-unique-id");
/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 *
 * @param longOrder
 * @param shortOrder
 */
function completeMarketOrder(order, completingOrder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a new filled order for order.
        const orderId = (0, get_unique_id_1.getUniqueId)(20);
        // 32, making it more unique and trackable, if desired.
        const aoriOrderId = `${orderId}-${(0, get_unique_id_1.getUniqueId)(20)}`;
        const time = new Date().getTime();
        const createdOrder = yield orders_1.default.create(Object.assign(Object.assign({ orderId,
            aoriOrderId }, order), { time }));
        if (!createdOrder) {
            return [false, "Making order not created!"];
        }
        const entryPrice = completingOrder.price;
        const timeOfPositionCreation = new Date().getTime();
        const positionIdOfOrder = (0, get_unique_id_1.getUniqueId)(20);
        const orderLiquidationPrice = (0, calculate_liquidation_price_1.default)(order.positionType, entryPrice, order.leverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(order.leverage));
        const positionIdOfCompletingOrder = (0, get_unique_id_1.getUniqueId)(20);
        const completingOrderLiquidationPrice = (0, calculate_liquidation_price_1.default)(completingOrder.positionType, entryPrice, completingOrder.leverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(completingOrder.leverage));
        // 💡 Liquidate positions with liquidation prices here.
        const ordersPosition = yield positions_1.default.create({
            orderId: orderId,
            positionId: positionIdOfOrder,
            opener: order.opener,
            positionType: order.positionType, // "long" | "short"
            entryPrice: entryPrice,
            liquidationPrice: orderLiquidationPrice,
            time: timeOfPositionCreation
        });
        const completingOrdersPosition = yield positions_1.default.create({
            orderId: completingOrder.orderId,
            positionId: positionIdOfCompletingOrder,
            opener: completingOrder.opener,
            positionType: completingOrder.positionType, // "long" | "short"
            entryPrice: entryPrice,
            liquidationPrice: completingOrderLiquidationPrice,
            time: timeOfPositionCreation
        });
        // Valid that the completing order entirely fills the order.
        if (!ordersPosition || !completingOrdersPosition) {
            return [false, "Complete market order error 1."];
        }
        // Update the two orders.
        const updateOrdersPosition = yield orders_1.default.updateOne({ orderId: orderId }, { filled: true, fillingOrders: [completingOrder.orderId] });
        const updateCompletingOrdersPosition = yield orders_1.default.updateOne({ orderId: completingOrder.orderId }, { filled: true, fillingOrders: [orderId] });
        if (!updateOrdersPosition || !updateCompletingOrdersPosition) {
            return [false, "Complete market order error 1."];
        }
        return [true, ""];
    });
}
exports.default = completeMarketOrder;
