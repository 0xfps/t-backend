"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarginRatio = void 0;
/**
 * Calculate the margin ration of a position, necessary to
 * calculate the liquidation price for a long position.
 *
 * Formula (Chat GPT):
 * Total Value of Positions = Margin × Leverage
 * Margin Ratio = Margin / Total Value of Positions
 *
 * Returns a decimal to two decimal places.
 *
 * @param param0
 */
function calculateMarginRatio(leverage) {
    return parseFloat((1 / leverage).toFixed(2));
}
exports.calculateMarginRatio = calculateMarginRatio;
