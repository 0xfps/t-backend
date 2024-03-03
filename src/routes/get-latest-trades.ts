import { Router } from "express"
import getLatestTradesController from "../controllers/get-latest-trades"
const getLatestTradesRouter: Router = Router()

getLatestTradesRouter.get("/:ticker/:size", getLatestTradesController)
export default getLatestTradesRouter