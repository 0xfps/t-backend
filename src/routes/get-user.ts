import { Router } from "express"
import getUserController from "../controllers/get-user"

const getUserRouter: Router = Router()
getUserRouter.get("/:address", getUserController)
export default getUserRouter