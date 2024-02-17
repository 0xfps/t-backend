import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";

export default async function cancelOrderController(req: Request, res: Response) {
    const { orderId } = req.body

    const orderEntry = await ordersModel.findOne({ orderId: orderId })
    if (!orderEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Order not found!"
        }

        res.send(response)
        return
    }

    if (orderEntry.filled == true || (orderEntry.fillingOrders).length > 0) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Can't delete order as it is getting filled!"
        }

        res.send(response)
        return
    }

    const deleteOrder = ordersModel.deleteOne({ orderId: orderId })
    if (!deleteOrder) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Order could not be deleted!"
        }

        res.send(response)
        return
    }

    // Refund

    const response: ResponseInterface = {
        status: 200,
        msg: "Order deleted!"
    }

    res.send(response)
}