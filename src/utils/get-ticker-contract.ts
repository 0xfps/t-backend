import tickersModel from "../db/schema/tickers";

/**
 * Return the address of a ticker's market contract from
 * the smart contract.
 * 
 * @param ticker Ticker.
 */
export default async function getTickerContract(ticker: string): Promise<[boolean, string]> {
    const tickerData = await tickersModel.findOne({ ticker: ticker.toLowerCase() })

    console.log(tickerData)

    if (!tickerData) {
        return [false, ""]
    }

    return [true, tickerData.contractAddress]
}