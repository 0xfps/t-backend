import { Router } from "express"
import getLongOrdersController from "../controllers/get-long-orders"

const getLongOrdersRouter: Router = Router()

getLongOrdersRouter.get("/:ticker", getLongOrdersController)
export default getLongOrdersRouter