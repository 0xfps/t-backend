import { Request, Response } from "express"
import { LIMIT, MARKET, Order } from "../utils/constants"
import processLimitOrder from "./orders/limit-order"
import processMarketOrder from "./orders/market-order"
import getTickerContract from "../utils/get-ticker-contract"
import ResponseInterface from "../interfaces/response-interface"

/**
 * Opening a position is simply making a long or short position
 * in either limit or market types. The process of making
 * long and short orders are basically the same, just a tiny
 * bit different. While market orders iterate through existing
 * orders if any to find the perfect match between 10% slippage
 * before being added to the orders database if none is found,
 * limit orders are bound to be added to the database as they are
 * rarely filled.
 * 
 * Thanks to Aori, the new docs involve the option to make limit orders,
 * who knows what can be done with that.
 * 
 * Orders (`order`) are sent from the frontend, an order will contain
 * the following details:
 * positionType // "long" | "short"
 * type         // "limit" | "market"
 * opener
 * market       // BTC/USD
 * leverage
 * assetA
 * assetB
 * ticker       // tBTC.
 * size
 * price
 * time
 * 
 * Orders are passed to specific functions based on their `type` and `positionType`.
 * Orders are sent to this endpoint by appending them to the `order` key in the 
 * JSON body object like:
 * 
 * body: {
 *     order: {
 *         ...
 *     }
 * }
 */
export default async function openPositionController(req: Request, res: Response) {
    const { order } = req.body

    // OrderID and order time are calculated here.
    const { type, ticker }: Order = order

    // Check if the contract exists for the desired ticker, e.g (tBTC).
    // Tickers are converted to lower case in the function.
    const [tickerExists,] = await getTickerContract(order.ticker)

    // Do not proceed if market is insexistent.
    if (!tickerExists) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Market inexistent!"
        }

        res.send(response)
        return
    }

    let success = false, result = {}

    if (type == LIMIT)
        [success, result] = await processLimitOrder(order)

    if (type == MARKET)
        [success, result] = await processMarketOrder(order)

    if (!success) {
        // Return errors.
        console.log("Result ::", result)
    }

    // Return success.
}