import { Router } from "express"
import getUsersFilledOrdersController from "../controllers/get-users-filled-orders"
const getUsersFilledOrdersRouter: Router = Router()
getUsersFilledOrdersRouter.get("/:address", getUsersFilledOrdersController)
export default getUsersFilledOrdersRouter