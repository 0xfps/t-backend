import { Router } from "express"
import { getTickerInformationController } from "../controllers/get-ticker-information"
const getTickerInformationRouter: Router = Router()

getTickerInformationRouter.get("/:ticker", getTickerInformationController)
export default getTickerInformationRouter