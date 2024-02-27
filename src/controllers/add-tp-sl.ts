import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import positionsModel from "../db/schema/positions";

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
            tp: parseFloat(tp.toFixed(4)),
            sl: parseFloat(sl.toFixed(4)),
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