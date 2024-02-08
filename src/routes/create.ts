import { Router } from "express"
import createController from "../controllers/create"

const createRouter: Router = Router()
createRouter.post("/", createController)
export default createRouter