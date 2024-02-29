import { Request, Response } from "express";
import getTickerContract from "../utils/get-ticker-contract";
import ResponseInterface from "../interfaces/response-interface";
import positionsModel from "../db/schema/positions";

export async function getTickerInformationController(req: Request, res: Response) {
    const { ticker } = req.params

    // Check if the contract exists for the desired ticker, e.g(tBTC).
    // Tickers are converted to lower case in the function.
    const [tickerExists,] = await getTickerContract(ticker)

    // Do not proceed if market is insexistent.
    if (!tickerExists) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Market inexistent!"
        }

        res.send(response)
        return
    }

    const data = {
        change24h: 0,
        openInterest: 0,
        volume24h: 0,
        trades24h: 0,
        // [high, low]
        highLow24h: []
    }

    const h24 = 1000 * 60 * 60 * 24
    const tickersPositions = await positionsModel.find({ ticker: ticker })

    if (tickersPositions.length == 0) {
        const response: ResponseInterface = {
            status: 200,
            msg: "OK",
            data: data
        }

        res.send(response)
        return
    }

    // Earliest to current.
    const tickerChange24h = await positionsModel.find({ ticker: ticker, time: { $lte: new Date().getTime(), $gte: (new Date().getTime() - h24) } }).sort({ time: "ascending" })
    const latestPrice = tickerChange24h[tickerChange24h.length - 1].entryPrice
    const earliestPrice = tickerChange24h[0].entryPrice

    const change24h = ((latestPrice - earliestPrice) / earliestPrice) * 100

    const openInterest = tickersPositions.reduce(function (cV: any, position: any) {
        return cV + (position.size * position.openingMargin)
    }, 0)

    const volume24h = tickerChange24h.reduce(function (cV: any, position: any) {
        return cV + (position.size * position.openingMargin)
    }, 0)

    const trades24h = tickerChange24h.length
    const highLow24h = [latestPrice, earliestPrice]

    const response: ResponseInterface = {
        status: 200,
        msg: "OK",
        data: {
            change24h: change24h,
            openInterest: openInterest,
            volume24h: volume24h,
            trades24h: trades24h,
            // [high, low]
            highLow24h: highLow24h
        }
    }

    res.send(response)
    return
}