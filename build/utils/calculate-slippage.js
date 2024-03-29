"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSlippage = void 0;
const constants_1 = require("./constants");
/**
 * Calculates slippages for long and short market orders
 * within the `percentage`. For long orders,
 * slippages are below amount and for short orders,
 * slippages are above amount.
 *
 * @param positionType  Type of position.
 * @param percentage    Percentage to calculate.
 * @returns
 */
function calculateSlippage(positionType, amount) {
    if (amount == 0)
        return 0.0000;
    const slip = amount * constants_1.SPREAD * 0.01;
    if (positionType == constants_1.LONG)
        return parseFloat((amount - slip).toFixed(4));
    if (positionType == constants_1.SHORT)
        return parseFloat((amount + slip).toFixed(4));
    return 0.0000;
}
exports.calculateSlippage = calculateSlippage;
