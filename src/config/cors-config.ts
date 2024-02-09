import dotenv from "dotenv"
dotenv.config()

const whitelist = [
    "https://tradable.trade/",
    "https://tradable-backend.vercel.app/",
    "http://tradable.trade/",
    "http://tradable-backend.vercel.app/"
]

export const corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin:
        // 💡 Remove after Vercel origin is resolved.
        process.env.DEVELOPMENT_ENVIRONMENT == "true"
            ? "*"
            : function (origin: any, callback: any) {
                if (whitelist.indexOf(origin) !== -1) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS!'))
                }
            },

    // We basically use just two.
    methods: ["GET", "POST"]
}