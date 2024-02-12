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
    if (amount == 0) return 0.0000

    const slip = amount * percentage * 0.01

    if (positionType == LONG) return parseFloat((amount - slip).toString())
    if (positionType == SHORT) return parseFloat((amount + slip).toString())

    return 0.0000
}