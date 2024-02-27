"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
/**
 * Calculates the liquidation price for long and short
 * positions using the old formulas:
 *
 * Long:
 * Entry price / (1 + (Initial margin ratio / Leverage))
 *
 * Short:
 * Entry price / (1 - (Initial margin ratio / Leverage))
 *
 * These formulas have been updated to:
 *
 * Long:
 * entryPrice - (LIQUIDATION_THRESHOLD / leverage) * -1 * entryPrice
 *
 * Short:
 * entryPrice - (LIQUIDATION_THRESHOLD / leverage) * 1 * entryPrice
 *
 * @param positionType  Position type.
 * @param entryPrice    Entry price of matching order.
 * @param leverage      Order leverage.
 * @param marginRatio   Margin ratio, in decimal, not percentage.
 *                      0.01 not 1%.
 */
function calculateLiquidationPrice(positionType, entryPrice, leverage, marginRatio) {
    // Old formula.
    // return positionType == LONG ?
    //     parseFloat((entryPrice / (1 + (marginRatio / leverage))).toFixed(4))
    //     : parseFloat((entryPrice / (1 - (marginRatio / leverage))).toFixed(4))
    return positionType == constants_1.LONG ?
        parseFloat((entryPrice - ((constants_1.LIQUIDATION_THRESHOLD / leverage) * -1 * entryPrice)).toFixed(4))
        : parseFloat((entryPrice - ((constants_1.LIQUIDATION_THRESHOLD / leverage) * 1 * entryPrice)).toFixed(4));
}
exports.default = calculateLiquidationPrice;
