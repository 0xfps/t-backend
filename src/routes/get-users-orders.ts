import { Router } from "express"
import getUsersOrdersController from "../controllers/get-users-orders"

const getUsersOrdersRouter: Router = Router()
getUsersOrdersRouter.get("/:address", getUsersOrdersController)
export default getUsersOrdersRouter