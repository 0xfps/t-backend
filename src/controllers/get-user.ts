import { Request, Response } from "express"
import ResponseInterface from "../interfaces/response-interface"
import userAddressesModel from "../db/schema/user-addreses"

/**
 * Retrieves the tWallet address of `address`.
 * 
 * @param req Request.
 * @param res Response.
 * @returns 
 */
export default async function getUserController(req: Request, res: Response) {
    const { address } = req.params

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

    const response: ResponseInterface = {
        status: 200,
        msg: "OK",
        data: {
            wallet_address: addressEntry.tWallet
        }
    }

    res.send(response)
}