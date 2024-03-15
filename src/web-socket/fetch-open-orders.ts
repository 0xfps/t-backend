import fetchOpenLongOrders from "./fetch-open-long-orders";
import fetchOpenShortOrders from "./fetch-open-short-orders";

/**
 * Returns open orders from the orderbook as an array.
 * 
 * 💡
 * I think returning all orders from the orderbook will make the
 * code inefficient as the size of the orderbook grows. Consider
 * returning a slice of the orders. For example, returning the last
 * 10 - 15 respective orders in the orderbook.
 * 
 * @param ticker Ticker
 * @returns Open long and short orders from the orderbook.
 */
export default async function fetchOpenOrders(ticker: string) {
    const openLongs = await fetchOpenLongOrders(ticker)
    const openShorts = await fetchOpenShortOrders(ticker)
    
    return {
        longs: openLongs,
        shorts: openShorts
    }
}