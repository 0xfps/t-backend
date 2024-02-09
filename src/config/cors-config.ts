import dotenv from "dotenv"
import { request } from "express"
dotenv.config()

const whitelist = [
    "https://tradable.trade/",
    "https://tradable-backend.vercel.app/",
    "http://tradable.trade/",
    "http://tradable-backend.vercel.app/"
]

const corsOrigin = request.headers["origin"]

export const corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin:
        // 💡 Remove after Vercel origin is resolved.
        process.env.DEVELOPMENT_ENVIRONMENT == "true"
            ? "*"
            : function (origin: any, callback: any) {
                origin;
                if (whitelist.indexOf(corsOrigin as string) !== -1) {
                    callback(null, true)
                } else {
                    callback(new Error(`${corsOrigin} Not allowed by CORS!`))
                }
            },

    // We basically use just two.
    methods: ["GET", "POST"]
}