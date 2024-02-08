import { Request, Response } from "express"
import ResponseInterface from "../interfaces/response-interface"
import userAddressesModel from "../db/schema/user-addreses"
import createWallet from "../utils/create-wallet"
import { encryptPrivateKey } from "../utils/encrypt-decrypt"

/**
 * This controller creates a new Ethers JS wallet for an address.
 * The desired address is passed to the body of the JSON object
 * sent to the route.
 * 
 * { address }
 * 
 * Extra checks are added to ensure address is a valid EVM address.
 * 
 * After the wallet is created successfully, it is added to the
 * database.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function createController(req: Request, res: Response) {
    const { address } = req.body

    if (!address) {
        const response: ResponseInterface = {
            status: 400,
            msg: "No address specified."
        }
        res.send(response)
        return
    }

    if (address.slice(0, 2) !== "0x") {
        const response: ResponseInterface = {
            status: 400,
            msg: "Invalid address."
        }
        res.send(response)
        return
    }

    if (address.length != 42) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Invalid address length."
        }
        res.send(response)
        return
    }

    const databaseAddressData = await userAddressesModel.findOne({ user: address })

    if (databaseAddressData) {
        const response: ResponseInterface = {
            status: 302,
            msg: "Address existent."
        }
        res.send(response)
        return
    }

    const { privateKey, wallet } = createWallet()
    const encryptedPrivateKey = encryptPrivateKey(privateKey)

    const createUser = await userAddressesModel.create({
        user: address,
        tWallet: wallet,
        privateKey: encryptedPrivateKey,
        time_created: new Date().getTime()
    })

    if (!createUser) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Account could't be created!"
        }

        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 201,
        msg: "Account created successfully!",
        data: {
            wallet_address: wallet
        }
    }

    res.send(response)
}