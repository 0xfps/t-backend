import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import positionsModel from "../db/schema/positions";

export default async function getUsersPositionsController(req: Request, res: Response) {
    const { address } = req.body
    const addressPositions = await positionsModel.find({ opener: address }).sort({ time: -1 })
    if (!addressPositions) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Positions from opener not found!"
        }

        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: addressPositions
    }

    res.send(response)
}