import { Router } from "express"
import closePositionController from "../controllers/close-position"

const closePositionRouter: Router = Router()

closePositionRouter.post("/", closePositionController)
export default closePositionRouter