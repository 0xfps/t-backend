import { Request, Response } from "express";
import ResponseInterface from "../interfaces/response-interface";
import userAddressesModel from "../db/schema/user-addreses";
import ordersModel from "../db/schema/orders";

/**
 * Cancels all orders opened by `address` that aren't being filled.
 * We don't care about the ticker. Delete everything as long as
 * the fillingOrders property of the database is empty [] and 
 * filled is still false.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function cancelAllOrdersController(req: Request, res: Response) {
    const { address } = req.body

    if (!address) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Address not passed!"
        }
        res.send(response)
        return
    }

    const addressEntry = await userAddressesModel.findOne({ user: address })

    if (!addressEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Address not found!"
        }
        res.send(response)
        return
    }

    const tWallet = addressEntry.tWallet

    const deletion = ordersModel.deleteMany({
        opener: tWallet,
        filled: false,
        fillingOrders: [],
    })

    if (!deletion) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Could not delete orders!"
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "Orders deleted!"
    }

    res.send(response)
}