import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";

/**
 * Retrieves all orders placed by an `address`, passed in `req.params` from
 * the database, opened or closed.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function getUsersOrdersController(req: Request, res: Response) {
    const { address } = req.params
    const addressOrders = await ordersModel.find({ opener: address }).sort({ time: "descending" })
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