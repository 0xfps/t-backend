import { Request, Response } from "express";
import positionsModel from "../db/schema/positions"
import ResponseInterface from "../interfaces/response-interface";
import { LONG, MARKET, Order, SHORT } from "../utils/constants";
import ordersModel from "../db/schema/orders";
import processMarketOrder from "./orders/market-order";

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
    }

    const { positionType, orderId } = positionEntry

    const orderEntry = await ordersModel.findOne({ orderId: orderId })

    if (!orderEntry) {
        const response: ResponseInterface = {
            status: 404,
            msg: "Order not found for position!"
        }

        res.send(response)
    }

    const {
        type,
        opener,
        market,
        margin,
        leverage,
        assetA,
        assetB,
        ticker,
        size
    } = orderEntry

    const lastMarketPrice: any = ((await positionsModel.find({}).sort({ time: -1 })) as any).entryPrice

    let success = false, result = {}

    // All are sold off as market orders.
    // If long position, sell as short.
    // If short, long.
    if (positionType == LONG) {
        const newOrder: Order = {
            positionType: SHORT,
            type: MARKET,
            opener: opener,
            market: market,
            leverage: leverage,
            margin: margin,
            assetA: assetA,
            assetB: assetB,
            ticker: ticker,
            size: size,
            price: lastMarketPrice
        }; // Don't remove this ";".

        [success, result] = await processMarketOrder(newOrder)
    }

    if (positionType == SHORT) {
        const newOrder: Order = {
            positionType: LONG,
            type: MARKET,
            opener: opener,
            market: market,
            leverage: leverage,
            margin: margin,
            assetA: assetA,
            assetB: assetB,
            ticker: ticker,
            size: size,
            price: lastMarketPrice
        }; // Don't remove this ";".

        [success, result] = await processMarketOrder(newOrder)
    }

    if (!success) {
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
        data: result
    }

    res.send(response)
}