import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import closePosition from "./close/close-position";

/**
 * Closes a position specified by the positionId. Liquidating a positions is
 * simply force-closing the position.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function closePositionController(req: Request, res: Response) {
    const { positionId } = req.body

    // I think there maybe should be some sort of authorization
    // to validate the call to this endpoint in order to avoid
    // wrong calls.
    const [success, reason] = await closePosition(positionId)
    if (!success) {
        const response: ResponseInterface = {
            status: 400,
            msg: reason
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: reason
    }
    res.send(response)
}