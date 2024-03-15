import express, { Request, Response } from "express"
import expressWs from "express-ws"
import dotenv from "dotenv"
import cors from "cors"
import { corsOptions } from "./config/cors-config"
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
import { LONG, MARKET, SHORT } from "./utils/constants"
import match from "./controllers/matcher/match-limit"
import cancelOrderRouter from "./routes/cancel-order"
import getFundingRateTimeLeft from "./utils/get-funding-rate-time-left"
import fundingRate from "./utils/funding-rate"
import getUsersOpenOrdersRouter from "./routes/get-users-open-orders"
import getUsersFilledOrdersRouter from "./routes/get-users-filled-orders"
import getOrderRouter from "./routes/get-order"
import closeAllPositionsRouter from "./routes/close-all-positions"
import addTPAndSLRouter from "./routes/add-tp-sl"
import fetchOpenOrders from "./web-socket/fetch-open-orders"
import fetchMarketPrice from "./web-socket/fetch-market-price"
import getTickerInformationRouter from "./routes/get-ticker-information"
import checkForNewOrders from "./utils/check-for-new-orders"
import getAllTradesRouter from "./routes/get-all-trades"
import getLatestTradesRouter from "./routes/get-latest-trades"
import getTickerFundingRateTimeLeftRouter from "./routes/get-ticker-funding-rate-time-left"

/**
 * 🚨🚨🚨 READ THIS 🚨🚨🚨
 * 
 * Dear developer,
 * 
 * DO NOT change the return objects of any WebSocket endpoints without
 * notifying the entire team, and the frontend engineer, most importantly.
 * Because the current return objects have been used in integrations,
 * it will crash the web app.
 * 
 * Anthony.
 */

dotenv.config()
const { PORT, AUTH_KEY } = process.env

const app = express()
const appWs = expressWs(app).app

app.use(express.json())
app.use(express.urlencoded())
app.use(cors(corsOptions))

// Connection message.
app.get("/", function (req, res) {
    res.send({ msg: "Welcome to Tradable's Backend!" })
})

/**
 * WEB SOCKET IMPLEMENTATION.
 * 
 * The Tradable WebSocket performs a number of functions:
 * 
 * 1. Returning open orders.
 * Every second, the WebSocket retrieves orders submitted for a ticker from
 * the frontend, and the entry price of the last opened position for a ticker,
 * which is displayed on the frontend as the market price.
 * 
 * 2. Checking for new orders.
 * By design, after 5 minutes (300,000 milliseconds) of inactivity, the
 * WebSocket runs and funding rate is charged. Inactivity involves non-submission 
 * of orders for a ticker.
 * 
 * 3. Matching orders.
 * Every 5 seconds, it goes through unmatched existing orders in the orderbook
 * for a ticker and tries to match them.
 * 
 * 4. Return funding rate time left.
 * This data is used in a timed function to charge funding rate.
 * 
 * All these functions above are dependent on the `ticker` passed to the endpoint.
 * Actions are carried out with respect to the `ticker`. A `ticker` specifies a
 * trading market.
 */
appWs.ws("/market-data/:ticker", async function (ws, req) {
    const { ticker } = req.params

    // Fetch open orders and market price for a ticker.
    // Runs this functione every second.
    setInterval(async function () {
        const data = await fetchOpenOrders(ticker)
        const marketPrice = await fetchMarketPrice(ticker)

        const response = {
            ...data,
            marketPrice: marketPrice
        }

        // Send WebSocket message.
        ws.send(JSON.stringify(response))
    }, 1_000)

    // Run every 5 minutes.
    // Check to see if last order submitted for a ticker is older than 5 minutes,
    // and charge funding rate if true.
    setInterval(async function () {
        await checkForNewOrders(ticker)
    }, 300_000)

    // Make a call to an endpoint that compares long orders to short orders
    // every 5 seconds and tries to match them.
    // This can be the idea of an orderbook.
    // I don't know if this can function as a matching engine.
    // No shit, it did.
    setInterval(async function () {
        const allLongMarketOrders = await ordersModel.find({ type: MARKET, positionType: LONG, filled: false }).sort({ time: 1, price: -1 })
        const allShortMarketOrders = await ordersModel.find({ type: MARKET, positionType: SHORT, filled: false }).sort({ time: 1, price: -1 })

        if (allLongMarketOrders.length > 0 && allShortMarketOrders.length > 0)
            await match(allLongMarketOrders)
    }, 5000)

    // Charge funding rate once the timer returned by the function runs out.
    setInterval(async function () {
        await fundingRate(ticker)
    }, await getFundingRateTimeLeft(ticker))

    // Logger indicating successful WebSocket connection.
    console.log("WebSocket initiated!")
})

// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`)
})

// GET Endpoints.
app.use("/get-user-address", getUserRouter)
app.use("/get-order", getOrderRouter)
app.use("/get-long-orders", getLongOrdersRouter)
app.use("/get-short-orders", getShortOrdersRouter)
app.use("/get-users-orders", getUsersOrdersRouter)
app.use("/get-users-open-orders", getUsersOpenOrdersRouter)
app.use("/get-users-filled-orders", getUsersFilledOrdersRouter)
app.use("/get-users-positions", getUsersPositionsRouter)
app.use("/get-ticker-information", getTickerInformationRouter)
app.use("/get-all-trades", getAllTradesRouter)
app.use("/get-latest-trades", getLatestTradesRouter)
app.use("/get-ticker-funding-rate-time-left", getTickerFundingRateTimeLeftRouter)

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

    // API key is 292 in length.
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
app.use("/close-all-positions", closeAllPositionsRouter)
app.use("/add-tp-sl", addTPAndSLRouter)
app.use("/cancel-order", cancelOrderRouter)
app.use("/liquidate-position", liquidatePositionRouter)