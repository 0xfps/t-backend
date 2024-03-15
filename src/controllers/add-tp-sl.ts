import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import positionsModel from "../db/schema/positions";

/**
 * Adds TP (Take Profit) and SL (Stop Loss) prices to a paticular `positionId`.
 * TP and SL can be added inependently.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function addTPAndSLController(req: Request, res: Response) {
    const { positionId, tp, sl } = req.body
    if (!positionId) {
        const response: ResponseInterface = {
            status: 400,
            msg: "No position id specified."
        }
        res.send(response)
        return
    }

    const positionExists = await positionsModel.findOne({ positionId: positionId })
    if (!positionExists) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Position not found."
        }
        res.send(response)
        return
    }

    const positionUpdated = await positionsModel.updateOne(
        { positionId: positionId },
        {
            tp: tp ? parseFloat(tp.toFixed(4)) : 0,
            sl: sl ? parseFloat(sl.toFixed(4)) : 0,
        }
    )

    if (!positionUpdated) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Position TP/SL not updated."
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "Position TP/SL set."
    }
    res.send(response)
}