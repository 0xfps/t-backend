import { Request, Response } from "express";
import positionsModel from "../db/schema/positions"
import ResponseInterface from "../interfaces/response-interface";
import { LONG } from "../utils/constants";
import processLongMarketOrder from "./orders/long/long-market-order";
import ordersModel from "../db/schema/orders";

/**
 * Closes a position specified by the positionId.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function closePositionController(req: Request, res: Response) {
    const { positionId } = req.body

    // I think there maybe should be some sort of authorization
    // to validate the call to this endpoint in order to avoid
    // wrong calls.

    const positionEntry = await positionsModel.findOne({ positionId: positionId })

    if (!positionEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Position not found!"
        }

        res.send(response)
    }

    const { type, orderId } = positionEntry.positionType

    const orderEntry = await ordersModel.findOne({ orderId: orderId })

    if (!orderEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Order not found for position!"
        }

        res.send(response)
    }

    // Continue.
    // if (type == LONG) await processLongMarketOrder
}