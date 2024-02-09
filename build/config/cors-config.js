"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const whitelist = [
    "https://tradable.trade/",
    "https://tradable-backend.vercel.app/",
    "http://tradable.trade/",
    "http://tradable-backend.vercel.app/"
];
exports.corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin: 
    // 💡 Remove after Vercel origin is resolved.
    process.env.DEVELOPMENT_ENVIRONMENT == "true"
        ? "*"
        : function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error(`${origin} Not allowed by CORS!`));
            }
        },
    // We basically use just two.
    methods: ["GET", "POST"]
};
