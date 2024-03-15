import { Router } from "express"
import getUsersOpenOrdersController from "../controllers/get-users-open-orders"

const getUsersOpenOrdersRouter: Router = Router()
getUsersOpenOrdersRouter.get("/:address", getUsersOpenOrdersController)
export default getUsersOpenOrdersRouter