import { Request, Response } from "express";
import ordersModel from "../db/schema/orders";
import ResponseInterface from "../interfaces/response-interface";
import userAddressesModel from "../db/schema/user-addreses";
import incrementMargin from "../utils/increment-margin";

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

    const { user } = await userAddressesModel.findOne({ tWallet: orderEntry.opener })
    // 💡 Increment user's margin.
    await incrementMargin(user, orderEntry.margin * (10 ** 8))

    const deleteOrder = ordersModel.deleteOne({ orderId: orderId })
    if (!deleteOrder) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Order could not be deleted!"
        }

        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "Order deleted!"
    }

    res.send(response)
}