import { Router } from "express"
import getTickerFundingRateTimeLeftController from "../controllers/get-ticker-funding-rate-time-left"
const getTickerFundingRateTimeLeftRouter: Router = Router()

getTickerFundingRateTimeLeftRouter.get("/:ticker", getTickerFundingRateTimeLeftController)
export default getTickerFundingRateTimeLeftRouter