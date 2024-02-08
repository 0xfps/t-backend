import dotenv from "dotenv"
dotenv.config()

const whitelist = ["https://tradable.trade"]

export const corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin:
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