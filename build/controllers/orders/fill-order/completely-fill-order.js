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
const user_addreses_1 = __importDefault(require("../../../db/schema/user-addreses"));
const calculate_liquidation_price_1 = __importDefault(require("../../../utils/calculate-liquidation-price"));
const calculate_margin_ratio_1 = require("../../../utils/calculate-margin-ratio");
const constants_1 = require("../../../utils/constants");
const get_unique_id_1 = require("../../../utils/get-unique-id");
const increment_margin_1 = __importDefault(require("../../../utils/increment-margin"));
const liquidate_positions_1 = require("../../liquidator/liquidate-positions");
const tp_sl_1 = __importDefault(require("../../tp-sl/tp-sl"));
// Fills `filledOrder` completely and closes the DB.
// The focus is on `filledOrder`, not `fillingOrder`.
function completelyFillOrder(filledOrder, fillingOrder, isClosingOrder = false, usersEntryMarketPrice) {
    return __awaiter(this, void 0, void 0, function* () {
        const entryPrice = filledOrder.positionType == constants_1.SHORT ? filledOrder.price : fillingOrder.price;
        const leverage = parseInt(filledOrder.leverage);
        const timeOfPositionCreation = new Date().getTime();
        const positionIdOfOrder = (0, get_unique_id_1.getUniqueId)(20);
        const liquidationPrice = (0, calculate_liquidation_price_1.default)(filledOrder.positionType, entryPrice, leverage, (0, calculate_margin_ratio_1.calculateMarginRatio)(leverage));
        // 💡 Liquidate positions with liquidation prices here.
        // Liquidate positions.
        const liquidatablePositions = yield positions_1.default.find({ liquidationPrice: { $lte: entryPrice } });
        if (liquidatablePositions.length > 0)
            yield (0, liquidate_positions_1.liquidatePositions)(liquidatablePositions);
        // Liquidate positions.
        // Run Take profit and stop loss.
        // Stop loss first.
        // Take profit next.
        yield (0, tp_sl_1.default)(entryPrice);
        const { user } = yield user_addreses_1.default.findOne({ tWallet: filledOrder.opener });
        // Create position if the order is not being closed.
        if (!isClosingOrder) {
            const createdPosition = yield positions_1.default.create({
                orderId: filledOrder.orderId,
                positionId: positionIdOfOrder,
                opener: filledOrder.opener,
                positionType: filledOrder.positionType, // "long" | "short"
                ticker: filledOrder.ticker,
                entryPrice: entryPrice,
                liquidationPrice: liquidationPrice,
                tp: 0,
                sl: 0,
                openingMargin: filledOrder.margin,
                fundingRate: filledOrder.margin, // 0% for a start.
                time: timeOfPositionCreation
            });
            if (!createdPosition) {
                return [false, "Position could not be created!"];
            }
        }
        const updateOrderEntry = yield orders_1.default.updateOne({ orderId: filledOrder.orderId }, {
            filled: true,
            deleted: true,
            sizeLeft: 0,
            fillingOrders: [...filledOrder.fillingOrders, fillingOrder.orderId]
        });
        if (!updateOrderEntry) {
            return [false, "Order entry could not be updated!"];
        }
        const orderInPartialPosition = yield partial_positions_1.default.findOne({ orderId: filledOrder.orderId });
        if (orderInPartialPosition) {
            const update = yield partial_positions_1.default.deleteOne({ order: filledOrder.orderId });
            if (!update) {
                return [false, "Could not delete partial order!"];
            }
        }
        // Take profits or losses.
        if (isClosingOrder) {
            const currentMarketPrice = entryPrice;
            const usersEntryPrice = usersEntryMarketPrice;
            const buyValue = usersEntryPrice * filledOrder.size;
            const saleValue = currentMarketPrice * filledOrder.size;
            // If position type is a long, the users initial position was a short,
            // so the user longs to close.
            // We run the opening price size - sale price size
            // 
            // If position type is a short, the users initial position was a long,
            // so the user shorts to close.
            // We run the sale price size - opening price size
            let profit = 0;
            if (filledOrder.positionType == constants_1.LONG) {
                profit = (buyValue - saleValue) / filledOrder.leverage;
            }
            else {
                profit = (saleValue - buyValue) / filledOrder.leverage;
            }
            yield (0, increment_margin_1.default)(user, profit);
        }
        return [true, `Order ${filledOrder.orderId} filled!`];
    });
}
exports.default = completelyFillOrder;
