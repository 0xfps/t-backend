"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = exports.whitelist = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.whitelist = [
    "https://tradable.trade/",
    "https://tradable-backend.vercel.app/",
    "http://tradable.trade/",
    "http://tradable-backend.vercel.app/"
];
exports.corsOptions = {
    // If environment is development, allow calls from all origins,
    // else, restrict it to Tradable's website only.
    origin: process.env.DEVELOPMENT_ENVIRONMENT == "true"
        ? "*"
        : "*",
    // We basically use just two.
    methods: ["GET", "POST"]
};
