import { Request, Response } from "express"
import ordersModel from "../db/schema/orders"
import ResponseInterface from "../interfaces/response-interface"

export default async function getOrderController(req: Request, res: Response) {
    const { orderId } = req.params
    const order = await ordersModel.find({ orderId: orderId }).sort({ time: 1 })
    if (!order) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Not found!",
            data: {}
        }

        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: order
    }

    res.send(response)
}