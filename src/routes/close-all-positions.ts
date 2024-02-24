import { Router } from "express"
import closeAllPositionsController from "../controllers/close-all-positions"

const closeAllPositionsRouter: Router = Router()

closeAllPositionsRouter.post("/", closeAllPositionsController)
export default closeAllPositionsRouter