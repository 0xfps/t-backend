import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import closePosition from "./close/close-position";
import positionsModel from "../db/schema/positions";

/**
 * Closes all positions opened by the `opener`.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function closeAllPositionsController(req: Request, res: Response) {
    const { opener } = req.body

    // I think there maybe should be some sort of authorization
    // to validate the call to this endpoint in order to avoid
    // wrong calls.

    const openPositions = await positionsModel.find({ opener: opener })

    if (!openPositions || openPositions.length == 0) {
        const response: ResponseInterface = {
            status: 400,
            msg: "You have no open positions."
        }
        res.send(response)
        return
    }

    const promises = openPositions.map(async function ({ positionId }: any) {
        const [closeSuccess,] = await closePosition(positionId)
        return closeSuccess
    })

    const results = await Promise.all(promises)

    if (results.includes(false)) {
        const response: ResponseInterface = {
            status: 400,
            msg: "There was an error closing a position."
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "All positions closed."
    }
    res.send(response)
}