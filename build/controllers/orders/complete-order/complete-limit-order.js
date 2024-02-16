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
const calculate_twap_1 = __importDefault(require("../../../utils/calculate-twap"));
const get_unique_id_1 = require("../../../utils/get-unique-id");
const liquidate_positions_1 = require("../../liquidator/liquidate-positions");
/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 *
 * @param order
 * @param completingOrders
 */
function completeLimitOrder(order, completingOrders) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = true;
        if (!order.filled) {
            // Get size of order to be filled.
            const totalOrderSize = parseInt(order.size);
            // Get orders that have filled the order to be filled so far.
            let totalFilledSize = parseInt(order.fillingOrders.reduce(function (total, fillingOrder) {
                return total + fillingOrder.size;
            }, 0));
            // Get the remaining size to be filled.
            const fillingDifference = totalOrderSize - totalFilledSize;
            // Iterate and fill the order up if the size of the order to fill the
            // initial order, when added to the current size is still below the
            // total size.
            completingOrders.forEach(function (completingOrder) {
                return __awaiter(this, void 0, void 0, function* () {
                    const completingOrderSize = parseInt(completingOrder.size);
                    if ((completingOrderSize + totalFilledSize) <= totalOrderSize) {
                        // The completing order was fully executed.
                        /**
                         * Position created for completing order, NOT THE MAIN ORDER.
                         */
                        const entryPrice = parseInt(completingOrder.price);
                        const completingOrderLeverage = parseInt(completingOrder.leverage);
                        const timeOfPositionCreation = new Date().getTime();
                        const positionIdOfCompletingOrder = (0, get_unique_id_1.getUniqueId)(20);
                        const completingOrderLiquidationPrice = (0, calculate_liquidation_price_1.default)(completingOrder.positionType, entryPrice, completingOrderLeverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(completingOrderLeverage));
                        // 💡 Liquidate positions with liquidation prices here.
                        // Liquidate positions.
                        const liquidatablePositions = yield positions_1.default.find({ liquidationPrice: { $lte: entryPrice } });
                        if (liquidatablePositions.length > 0)
                            yield (0, liquidate_positions_1.liquidatePositions)(liquidatablePositions);
                        // Liquidate positions.
                        const completingOrdersPosition = yield positions_1.default.create({
                            orderId: completingOrder.orderId,
                            positionId: positionIdOfCompletingOrder,
                            opener: completingOrder.opener,
                            positionType: completingOrder.positionType, // "long" | "short"
                            entryPrice: entryPrice,
                            liquidationPrice: completingOrderLiquidationPrice,
                            time: timeOfPositionCreation
                        });
                        const updateOrdersPosition = yield orders_1.default.updateOne({ orderId: order.orderId }, 
                        // Not yet filled, but add the completing order.
                        { fillingOrders: [...order.fillingOrders, completingOrder.orderId] });
                        const updateCompletingOrdersPosition = yield orders_1.default.updateOne({ orderId: completingOrder.orderId }, { filled: true, fillingOrders: [...completingOrder.fillingOrders, order.orderId] });
                        if (!completingOrdersPosition || !updateCompletingOrdersPosition || !updateOrdersPosition) {
                            status = false;
                            return [false, "Complete limit order error 1."];
                        }
                        /**
                         * Position created for completing order, NOT THE MAIN ORDER.
                         */
                        /**
                         * Position created for the main order.
                         */
                        if (completingOrder.size + totalFilledSize == totalOrderSize) {
                            const { size, fillingOrders } = yield orders_1.default.findOne({ orderId: order.orderId });
                            // Update order to be filled.
                            const entryPrice = yield (0, calculate_twap_1.default)(fillingOrders, parseInt(size));
                            const timeOfPositionCreation = new Date().getTime();
                            const orderLeverage = parseInt(order.leverage);
                            const positionIdOfOrder = (0, get_unique_id_1.getUniqueId)(20);
                            const orderLiquidationPrice = (0, calculate_liquidation_price_1.default)(order.positionType, entryPrice, orderLeverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(orderLeverage));
                            // 💡 Liquidate positions with liquidation prices here.
                            // Liquidate positions.
                            const liquidatablePositions = yield positions_1.default.find({ liquidationPrice: { $lte: entryPrice } });
                            if (liquidatablePositions.length > 0)
                                yield (0, liquidate_positions_1.liquidatePositions)(liquidatablePositions);
                            // Liquidate positions.
                            // const ordersPosition = await positionsModel.create({
                            //     orderId: order.orderId,
                            //     positionId: positionIdOfOrder,
                            //     opener: order.opener,
                            //     positionType: order.positionType,       // "long" | "short"
                            //     entryPrice: entryPrice,
                            //     liquidationPrice: orderLiquidationPrice,
                            //     time: timeOfPositionCreation
                            // })
                            // const updateOrdersPosition = await ordersModel.updateOne(
                            //     { orderId: order.orderId },
                            //     { filled: true }
                            // )
                            // if (!ordersPosition || !updateOrdersPosition) {
                            //     status = false
                            //     return [false, "Complete limit order error 1."]
                            // }
                        }
                        totalFilledSize += completingOrderSize;
                    }
                });
            });
        }
        return [status, ""];
    });
}
exports.default = completeLimitOrder;
