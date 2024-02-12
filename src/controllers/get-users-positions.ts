import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";

export default async function getUsersPositionsController(req: Request, res: Response) {
    const { address } = req.body
    const addressOrders = await ordersModel.find({ opener: address }).sort({ time: -1 })
    if (!addressOrders) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Orders from opener not found!"
        }

        res.send(response)
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: addressOrders
    }

    res.send(response)
}