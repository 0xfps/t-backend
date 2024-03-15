import { Request, Response } from "express";
import getFundingRateTimeLeft from "../utils/get-funding-rate-time-left";
import ResponseInterface from "../interfaces/response-interface";

/**
 * Funding rates are charged every 8 hours. This function returns the 8 hour difference
 * between the last funding rate time and the next funding rate.
 * 
 * @param req Request.
 * @param res Response.
 */
export default async function getTickerFundingRateTimeLeftController(req: Request, res: Response) {
    const { ticker } = req.params

    const timeLeft = await getFundingRateTimeLeft(ticker)
    const response: ResponseInterface = {
        status: 200,
        msg: "OK",
        data: {
            timeLeft: timeLeft
        }
    }
    res.send(response)
}