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
const partial_positions_1 = __importDefault(require("../../../db/schema/partial-positions"));
const positions_1 = __importDefault(require("../../../db/schema/positions"));
const calculate_liquidation_price_1 = __importDefault(require("../../../utils/calculate-liquidation-price"));
const calculate_margin_ratio_1 = require("../../../utils/calculate-margin-ratio");
const calculate_twap_1 = __importDefault(require("../../../utils/calculate-twap"));
const get_unique_id_1 = require("../../../utils/get-unique-id");
const liquidate_positions_1 = require("../../liquidator/liquidate-positions");
function partiallyFillOrder(filledOrder, fillingOrder) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the filling orders for the current order being filled.
        const { size, sizeLeft } = yield orders_1.default.findOne({ orderId: filledOrder.orderId });
        // Get the entry price from the orders filling the stuff previously and the current one to fill it.
        const entryPrice = yield (0, calculate_twap_1.default)([...filledOrder.fillingOrders, fillingOrder.orderId], parseFloat(size));
        const timeOfPositionCreation = new Date().getTime();
        const leverage = parseInt(filledOrder.leverage);
        const positionIdOfOrder = (0, get_unique_id_1.getUniqueId)(20);
        const liquidationPrice = (0, calculate_liquidation_price_1.default)(filledOrder.positionType, entryPrice, leverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(leverage));
        // 💡 Liquidate positions with liquidation prices here.
        // Liquidate positions.
        const liquidatablePositions = yield positions_1.default.find({ liquidationPrice: { $lte: entryPrice } });
        if (liquidatablePositions.length > 0)
            yield (0, liquidate_positions_1.liquidatePositions)(liquidatablePositions);
        // Liquidate positions.
        const partiallyFilledOrderExists = yield partial_positions_1.default.findOne({ orderId: filledOrder.orderId });
        const percentageFilled = parseFloat((100 - (((sizeLeft - fillingOrder.size) / size) * 100)).toFixed(2));
        let partialPosition;
        if (!partiallyFilledOrderExists) {
            partialPosition = yield partial_positions_1.default.create({
                orderId: filledOrder.orderId,
                partialPositionId: positionIdOfOrder,
                opener: filledOrder.opener,
                partialPositionType: filledOrder.positionType, // "long" | "short"
                ticker: filledOrder.ticker,
                entryPrice: entryPrice,
                liquidationPrice: liquidationPrice,
                size: filledOrder.size,
                leverage: filledOrder.leverage,
                tp: 0,
                sl: 0,
                openingMargin: filledOrder.margin,
                fundingRate: filledOrder.margin, // 0% for a start.
                isComplete: false,
                percentageFilled: percentageFilled,
                time: timeOfPositionCreation
            });
        }
        else {
            partialPosition = yield partial_positions_1.default.updateOne({ orderId: filledOrder.orderId }, {
                entryPrice: entryPrice,
                liquidationPrice: liquidationPrice,
                isComplete: false,
                percentageFilled: percentageFilled,
                time: timeOfPositionCreation
            });
        }
        if (!partialPosition) {
            return [false, "Position could not be created!"];
        }
        const updateOrderEntry = yield orders_1.default.updateOne({ orderId: filledOrder.orderId }, {
            fillingOrders: [...filledOrder.fillingOrders, fillingOrder.orderId],
            sizeLeft: parseFloat((filledOrder.sizeLeft - fillingOrder.size).toFixed(4))
        });
        if (!updateOrderEntry) {
            return [false, "Order entry could not be updated!"];
        }
        return [true, `Order ${filledOrder.orderId} filled!`];
    });
}
exports.default = partiallyFillOrder;
