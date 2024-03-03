import { Router } from "express"
import getAllTradesController from "../controllers/get-all-trades"
const getAllTradesRouter: Router = Router()

getAllTradesRouter.get("/:ticker", getAllTradesController)
export default getAllTradesRouter