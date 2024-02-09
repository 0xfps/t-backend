import dotenv from "dotenv"
dotenv.config()

export const whitelist = [
    "https://tradable.trade/",
    "https://tradable-backend.vercel.app/",
    "http://tradable.trade/",
    "http://tradable-backend.vercel.app/"
]

export const corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin: process.env.DEVELOPMENT_ENVIRONMENT == "true"
        ? "*"
        : "*",

    // We basically use just two.
    methods: ["GET", "POST"]
}