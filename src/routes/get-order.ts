import { Router } from "express"
import getOrderController from "../controllers/get-order"
const getOrderRouter: Router = Router()

getOrderRouter.get("/:orderId", getOrderController)
export default getOrderRouter