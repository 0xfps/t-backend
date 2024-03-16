import { Router } from "express"
import cancelAllOrdersController from "../controllers/cancel-all-orders"

const cancelAllOrdersRouter: Router = Router()
cancelAllOrdersRouter.post("/", cancelAllOrdersController)
export default cancelAllOrdersRouter