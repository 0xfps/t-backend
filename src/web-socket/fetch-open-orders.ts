import fetchOpenLongOrders from "./fetch-open-long-orders";
import fetchOpenShortOrders from "./fetch-open-short-orders";

export default async function fetchOpenOrders(ticker: string) {
    const openLongs = await fetchOpenLongOrders(ticker)
    const openShorts = await fetchOpenShortOrders(ticker)
    
    return {
        longs: openLongs,
        shorts: openShorts
    }
}