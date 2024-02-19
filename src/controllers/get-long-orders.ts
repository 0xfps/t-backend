import { Request, Response } from "express"
import { LONG } from "../utils/constants"
import ordersModel from "../db/schema/orders"
import ResponseInterface from "../interfaces/response-interface"

export default async function getLongOrdersController(req: Request, res: Response) {
    const { ticker } = req.params

    const longOrders = await ordersModel.find({ positionType: LONG, ticker: ticker }).sort({ time: 1 })
    if (!longOrders) {
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
    longOrders.forEach(function ({ size, price }) {
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