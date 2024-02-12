import { Router } from "express"
import liquidatePositionController from "../controllers/liquidate-position"

const liquidatePositionRouter: Router = Router()
liquidatePositionRouter.post("/", liquidatePositionController)
export default liquidatePositionRouter