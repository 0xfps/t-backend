import SL from "./sl";
import TP from "./tp";

/**
 * Runs two functions to stop losses and take profits respectively.
 * 
 * @param price Price.
 */
export default async function TPxSL(price: number) {
    await SL(price)
    await TP(price)
}