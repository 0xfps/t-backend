import { Router } from "express"
import getShortOrdersController from "../controllers/get-short-orders"

const getShortOrdersRouter: Router = Router()

getShortOrdersRouter.get("/", getShortOrdersController)
export default getShortOrdersRouter