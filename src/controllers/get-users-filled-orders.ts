import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";

/**
 * Returns all orders opened by a user that have been filled.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function getUsersFilledOrdersController(req: Request, res: Response) {
    const { address } = req.params
    const addressOrders = await ordersModel.find({ opener: address, filled: true }).sort({ time: -1 })
    if (!addressOrders) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Orders from opener not found!"
        }

        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: addressOrders
    }

    res.send(response)
}