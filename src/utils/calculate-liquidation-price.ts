import { LIQUIDATION_THRESHOLD, LONG, PositionTypes } from "./constants";

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
export default function calculateLiquidationPrice(
    positionType: PositionTypes,
    entryPrice: number,
    leverage: number,
    marginRatio: number
): number {

    // Old formula.
    // return positionType == LONG ?
    //     parseFloat((entryPrice / (1 + (marginRatio / leverage))).toFixed(4))
    //     : parseFloat((entryPrice / (1 - (marginRatio / leverage))).toFixed(4))

    return positionType == LONG ?
        parseFloat((entryPrice - ((LIQUIDATION_THRESHOLD / leverage) * -1 * entryPrice)).toFixed(4))
        : parseFloat((entryPrice - ((LIQUIDATION_THRESHOLD / leverage) * 1 * entryPrice)).toFixed(4))
}