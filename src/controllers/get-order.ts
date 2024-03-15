import { Request, Response } from "express"
import ordersModel from "../db/schema/orders"
import ResponseInterface from "../interfaces/response-interface"

/**
 * Returns the order data for a specific `orderId` passed in `req.params` from the backend.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function getOrderController(req: Request, res: Response) {
    const { orderId } = req.params
    const order = await ordersModel.findOne({ orderId: orderId })
    if (!order) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Order not found!",
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