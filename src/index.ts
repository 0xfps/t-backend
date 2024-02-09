import express, { Request, Response } from "express"
import expressWs from "express-ws"
import dotenv from "dotenv"
import cors from "cors"
import { corsOptions, whitelist } from "./config/cors-config"
import createRouter from "./routes/create"
import "./db/index"
import { decryptAPIKey } from "./utils/encrypt-decrypt"
import ResponseInterface from "./interfaces/response-interface"

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
    // Do nothing for now.
    // When set, send order book every second to frontend.

    console.log("Websocket initiated!")
})

// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`)
})

// GET Endpoints.

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
            const response: ResponseInterface = { status: 403, msg: `You cannot make calls from ${origin}` }
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

// POST Endpoints.
app.use("/create", createRouter)