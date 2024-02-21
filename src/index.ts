import express, { Request, Response } from "express"
import expressWs from "express-ws"
import dotenv from "dotenv"
import cors from "cors"
import { corsOptions, whitelist } from "./config/cors-config"
import createRouter from "./routes/create"
import "./db/index"
import { decryptAPIKey } from "./utils/encrypt-decrypt"
import ResponseInterface from "./interfaces/response-interface"
import getUserRouter from "./routes/get-user"
import openPositionRouter from "./routes/open-position"
import getLongOrdersRouter from "./routes/get-long-orders"
import getShortOrdersRouter from "./routes/get-short-orders"
import closePositionRouter from "./routes/close-position"
import getUsersOrdersRouter from "./routes/get-users-orders"
import liquidatePositionRouter from "./routes/liquidate-position"
import getUsersPositionsRouter from "./routes/get-users-positions"
import ordersModel from "./db/schema/orders"
import { GET, LONG, MARKET, POST, SHORT } from "./utils/constants"
import match from "./controllers/matcher/match-limit"
import cancelOrderRouter from "./routes/cancel-order"
import getFundingRateTimeLeft from "./utils/get-funding-rate-time-left"
import fundingRate from "./utils/funding-rate"
import getUsersOpenOrdersRouter from "./routes/get-users-open-orders"
import getUsersFilledOrdersRouter from "./routes/get-users-filled-orders"
import getOrderRouter from "./routes/get-order"

dotenv.config()
const { PORT, AUTH_KEY, DEVELOPMENT_ENVIRONMENT, ENVIRONMENT_URL } = process.env

const app = express()
const appWs = expressWs(app).app

app.use(express.json())
app.use(express.urlencoded())
app.use(cors(corsOptions))

// Connection message.
app.get("/", function (req, res) {
    res.send({ msg: "Welcome to Tradable's Backend!" })
})

appWs.ws("/market-data/:ticker", async function (ws, req) {
    const URL = ENVIRONMENT_URL ? ENVIRONMENT_URL : "http://localhost:8080"
    const { ticker } = req.params

    setInterval(async function () {
        // Do nothing for now.
        // When set, send order book every second to frontend.
        const shortsRequest = await fetch(`${URL}/get-short-orders/${ticker}`, {
            method: GET,
            headers: {
                "api-key": process.env.ENCRYPTED_DEVELOPMENT_API_KEY as string || process.env.ENCRYPTED_PRODUCTION_API_KEY as string
            }
        })

        const longsRequest = await fetch(`${URL}/get-long-orders/${ticker}`, {
            method: GET,
            headers: {
                "api-key": process.env.ENCRYPTED_DEVELOPMENT_API_KEY as string || process.env.ENCRYPTED_PRODUCTION_API_KEY as string
            }
        })

        const longs = await longsRequest.json()
        const shorts = await shortsRequest.json()

        const data = {
            longs: longs.data.body,
            shorts: shorts.data.body
        }

        ws.send(JSON.stringify(data))
    }, 1000)

    // Make a call to an endpoint that compares long orders to short orders
    // every 5 seconds and tries to match them.
    // This can be the idea of an orderbook.
    // I don't know if this can function as a matching engine.
    setInterval(async function () {
        // Do nothing for now.
        // When set, send order book every second to frontend.
        const allLongLimitOrders = await ordersModel.find({ type: MARKET, positionType: LONG, filled: false }).sort({ time: 1, price: -1 })
        const allShortLimitOrders = await ordersModel.find({ type: MARKET, positionType: SHORT, filled: false }).sort({ time: 1, price: -1 })
        await match(allLongLimitOrders, allShortLimitOrders)
    }, 5000)

    setInterval(async function () {
        await fundingRate(ticker)
    }, await getFundingRateTimeLeft(ticker))

    console.log("Websocket initiated!")
})

// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`)
})

// GET Endpoints.
app.use("/get-user-address", getUserRouter)
// GET endpoints.
app.use("/get-order", getOrderRouter)
app.use("/get-long-orders", getLongOrdersRouter)
app.use("/get-short-orders", getShortOrdersRouter)
app.use("/get-users-orders", getUsersOrdersRouter)
app.use("/get-users-open-orders", getUsersOpenOrdersRouter)
app.use("/get-users-filled-orders", getUsersFilledOrdersRouter)
app.use("/get-users-positions", getUsersPositionsRouter)

/**
 * Middleware for all POST endpoints.
 * All post endpoints secure themselves by decrypting the API key
 * passed to the "api-key" key of the JSON object sent along side the header.
 * The decrypted value is then compared against the .env variable to 
 * ensure a match. On any mismatch, the access is restricted.
 */
app.use(function (req: Request, res: Response, next: () => void) {
    const encryptedAPIKey: string = req.headers["api-key"] as string

    // 🚨 I removed this for testing.
    // const origin = req.headers["origin"]

    // While not in development, ensure that calls are made from only the whitelisted
    // URLs.
    // if (DEVELOPMENT_ENVIRONMENT == undefined) {
    //     if (!whitelist.includes(origin as string)) {
    //         const response: ResponseInterface = { status: 403, msg: `You cannot make calls from ${origin}.` }
    //         res.send(response)
    //         return
    //     }
    // }

    if (encryptedAPIKey.length != 292) {
        const response: ResponseInterface = { status: 403, msg: "Invalid API Key!" }
        res.send(response)
        return
    }

    const decryptedAPIKey = decryptAPIKey(encryptedAPIKey)

    if (AUTH_KEY !== decryptedAPIKey) {
        const response: ResponseInterface = { status: 403, msg: "Unauthorized!" }
        res.send(response)
        return
    }

    next()
})

// POST Endpoints.
app.use("/create", createRouter)
app.use("/open-position", openPositionRouter)
app.use("/close-position", closePositionRouter)
app.use("/cancel-order", cancelOrderRouter)
app.use("/liquidate-position", liquidatePositionRouter)