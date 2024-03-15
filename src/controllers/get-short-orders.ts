import { Request, Response } from "express"
import ordersModel from "../db/schema/orders"
import { SHORT } from "../utils/constants"
import ResponseInterface from "../interfaces/response-interface"

/**
 * Retrieves all short orders placed for a `ticker`, passed in `req.params` from
 * the database.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function getShortOrdersController(req: Request, res: Response) {
    const { ticker } = req.params
    const shortOrders = await ordersModel.find({ positionType: SHORT, ticker: ticker }).sort({ time: "descending" })
    if (!shortOrders) {
        const response: ResponseInterface = {
            status: 200,
            msg: "OK!",
            data: {
                body: []
            }
        }

        res.send(response)
        return
    }

    const result: Object[] = []
    shortOrders.forEach(function ({ size, price }) {
        result.push({
            size,
            price
        })
    })

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: {
            body: result
        }
    }

    res.send(response)
}