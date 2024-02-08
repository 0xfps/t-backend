import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
const { DEVELOPMENT_ENVIRONMENT, TEST_MONGO_DB_URL, LIVE_MONGO_DB_URL } = process.env

const URL = DEVELOPMENT_ENVIRONMENT == "true" ? TEST_MONGO_DB_URL : LIVE_MONGO_DB_URL

if (URL) {
    ; (async function () {
        await mongoose.connect(URL)
        console.log("Connected to database!")
    })()
} else console.log("No database information!")