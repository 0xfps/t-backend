import { Router } from "express"
import addTPAndSLController from "../controllers/add-tp-sl"

const addTPAndSLRouter: Router = Router()
addTPAndSLRouter.post("/", addTPAndSLController)
export default addTPAndSLRouter