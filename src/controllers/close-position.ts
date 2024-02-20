import { Request, Response } from "express";
import positionsModel from "../db/schema/positions"
import ResponseInterface from "../interfaces/response-interface";
import { LONG, MARKET, Order, SHORT } from "../utils/constants";
import ordersModel from "../db/schema/orders";
import processMarketOrder from "./orders/market-order";
import userAddressesModel from "../db/schema/user-addreses";
import incrementMargin from "../utils/increment-margin";

/**
 * Closes a position specified by the positionId.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function closePositionController(req: Request, res: Response) {
    const { positionId } = req.body

    // I think there maybe should be some sort of authorization
    // to validate the call to this endpoint in order to avoid
    // wrong calls.

    const positionEntry = await positionsModel.findOne({ positionId: positionId })

    if (!positionEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Position not found!"
        }

        res.send(response)
        return
    }

    const { positionType, orderId, fundingRate } = positionEntry

    const orderEntry = await ordersModel.findOne({ orderId: orderId })

    if (!orderEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Order not found for position!"
        }

        res.send(response)
        return
    }

    const {
        margin,
        leverage,
        opener,
        price: initialPrice,
        size
    } = orderEntry

    const tradingAmount = margin * leverage
    const lastMarketPrice: any = ((await positionsModel.find({}).sort({ time: -1 })) as any)[0].entryPrice

    let success = false, result = {}

    const { user } = await userAddressesModel.findOne({ tWallet: opener })

    // All are sold off as market orders.
    // If long position, sell as short.
    // If short, long.
    // More info at:
    // https://pippenguin.com/forex/learn-forex/calculate-profit-forex/#:~:text=To%20calculate%20forex%20profit%2C%20subtract,Trade%20Size%20%C3%97%20Pip%20Value.
    if (positionType == LONG) {
        const totalProfit = (lastMarketPrice - initialPrice) * size * leverage
        const profit = totalProfit + ((fundingRate / totalProfit) * 100)

        if (profit > 0) {
            // 💡 Increment user's margin.
            await incrementMargin(user, profit * (10 ** 8))
        }
    }

    // Math culled from:
    // https://leverage.trading/short-selling-calculator/
    if (positionType == SHORT) {
        const totalProfit = (initialPrice - lastMarketPrice) * size * leverage
        const profit = totalProfit + ((fundingRate / totalProfit) * 100)

        if (profit > 0) {
            // 💡 Increment user's margin.
            await incrementMargin(user, profit * (10 ** 8))
        }
    }

    const deletedPosition = await positionsModel.deleteOne({ positionId: positionId })

    if (!success || !deletedPosition) {
        const response: ResponseInterface = {
            status: 400,
            msg: "Error"
        }
        res.send(response)
        return
    }

    const response: ResponseInterface = {
        status: 200,
        msg: "OK!",
        data: {
            result: "Good."
        }
    }

    res.send(response)
}