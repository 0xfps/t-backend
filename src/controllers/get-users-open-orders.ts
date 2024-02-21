import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";

export default async function getUsersOpenOrdersController(req: Request, res: Response) {
    const { address } = req.params
    const addressOrders = await ordersModel.find({ opener: address, filled: false }).sort({ time: -1 })
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