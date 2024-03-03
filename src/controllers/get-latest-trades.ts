import { Request, Response } from "express";
import positionsModel from "../db/schema/positions";
import ResponseInterface from "../interfaces/response-interface";

export default async function getLatestTradesController(req: Request, res: Response) {
    const { ticker, size } = req.params

    const latestTrades = await positionsModel.find({ ticker: ticker }).sort({ time: "descending" })
    if (latestTrades.length == 0) {
        const response: ResponseInterface = {
            status: 400,
            msg: "No trades yet.",
            data: []
        }

        res.send(response)
        return
    }

    let lastNTrades
    if (latestTrades.length > parseInt(size))
        lastNTrades = latestTrades.slice(0, parseInt(size) + 1)
    else
        lastNTrades = latestTrades

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: lastNTrades
    }

    res.send(response)
}