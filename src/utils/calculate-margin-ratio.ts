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
export function calculateMarginRatio(leverage: number): number {
    return parseFloat((1 / leverage).toFixed(2))
}