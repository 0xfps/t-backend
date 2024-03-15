/**
 * Calls to the Binance, Bitget, Bybit, Coinbase and OKX APIs, retrieves
 * market data of an asset based on `ticker`, and returns the average market price
 * of the asset.
 * 
 * @param ticker Ticker
 * @returns Aggregate price.
 */
export default function aggregateSpotPrice(ticker: string): number {
    ticker = ticker.slice(1, ticker.length)

    return 0
}