import { Request, Response } from "express";
import positionsModel from "../db/schema/positions";
import ResponseInterface from "../interfaces/response-interface";

export default async function getAllTradesController(req: Request, res: Response) {
    const { ticker } = req.params

    const latestTrades = await positionsModel.find({ ticker: ticker }).sort({ time: "descending" })

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: latestTrades
    }

    res.send(response)
}