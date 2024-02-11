import { LONG, PositionTypes, SHORT } from "./constants";

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
export function calculateSlippage(
    positionType: PositionTypes,
    amount: number,
    percentage: number
): number {
    if (amount == 0) return 0

    const slip = amount * percentage * 0.01

    if (positionType == LONG) return amount - slip
    if (positionType == SHORT) return amount + slip

    return 0
}