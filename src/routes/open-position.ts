import { Router } from "express"
import openPositionController from "../controllers/open-position"

const openPositionRouter: Router = Router()
openPositionRouter.post("/", openPositionController)
export default openPositionRouter