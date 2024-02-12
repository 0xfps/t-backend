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
import getUsersPositionsRouter from "./routes/get-users-positions"
import liquidatePositionRouter from "./routes/liquidate-position"

dotenv.config()
const { PORT, AUTH_KEY, DEVELOPMENT_ENVIRONMENT } = process.env

const app = express()
const appWs = expressWs(app).app

app.use(express.json())
app.use(express.urlencoded())
app.use(cors(corsOptions))

// Connection message.
app.get("/", function (req, res) {
    res.send({ msg: "Welcome to Tradable's Backend!" })
})

appWs.ws("/", function (ws) {
    setInterval(async function () {
        // Do nothing for now.
        // When set, send order book every second to frontend.
        const shortsRequest = await fetch("http://localhost:8080/get-short-orders", {
            method: "GET",
            headers: {
                "api-key": process.env.ENCRYPTED_DEVELOPMENT_API_KEY as string ?? process.env.ENCRYPTED_PRODUCTION_API_KEY as string
            }
        })

        const longsRequest = await fetch("http://localhost:8080/get-long-orders", {
            method: "GET",
            headers: {
                "api-key": process.env.ENCRYPTED_DEVELOPMENT_API_KEY as string ?? process.env.ENCRYPTED_PRODUCTION_API_KEY as string
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
    // every 30 seconds and tries to match them.
    // This can be the idea of an orderbook.

    console.log("Websocket initiated!")
})

// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`)
})

// GET Endpoints.
app.use("/get-user-address", getUserRouter)

/**
 * Middleware for all POST endpoints.
 * All post endpoints secure themselves by decrypting the API key
 * passed to the "api-key" key of the JSON object sent along side the header.
 * The decrypted value is then compared against the .env variable to 
 * ensure a match. On any mismatch, the access is restricted.
 */
app.use(function (req: Request, res: Response, next: () => void) {
    const encryptedAPIKey: string = req.headers["api-key"] as string

    const origin = req.headers["origin"]

    // While not in development, ensure that calls are made from only the whitelisted
    // URLs.
    if (DEVELOPMENT_ENVIRONMENT == undefined) {
        if (!whitelist.includes(origin as string)) {
            const response: ResponseInterface = { status: 403, msg: `You cannot make calls from ${origin}.` }
            res.send(response)
            return
        }
    }

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

// Protected GET endpoints.
app.use("/get-long-orders", getLongOrdersRouter)
app.use("/get-short-orders", getShortOrdersRouter)
app.use("/get-users-positions", getUsersPositionsRouter)

// POST Endpoints.
app.use("/create", createRouter)
app.use("/open-position", openPositionRouter)
app.use("/close-position", closePositionRouter)
app.use("/liquidate-position", liquidatePositionRouter)