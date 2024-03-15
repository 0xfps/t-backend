import { Router } from "express"
import getUsersPositionsController from "../controllers/get-users-positions"

const getUsersPositionsRouter: Router = Router()
getUsersPositionsRouter.get("/:address", getUsersPositionsController)
export default getUsersPositionsRouter