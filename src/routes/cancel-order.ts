import { Router } from "express"
import cancelOrderController from "../controllers/cancel-order"

const cancelOrderRouter: Router = Router()
cancelOrderRouter.post("/", cancelOrderController)
export default cancelOrderRouter