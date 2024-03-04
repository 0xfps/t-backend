import { Request, Response } from "express";
import getFundingRateTimeLeft from "../utils/get-funding-rate-time-left";
import ResponseInterface from "../interfaces/response-interface";

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