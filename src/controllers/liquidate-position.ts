import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import closePosition from "./close/close-position";

export default async function liquidatePositionController(req: Request, res: Response) {
    const { positionId } = req.body

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