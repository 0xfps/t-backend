"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cors_config_1 = require("./config/cors-config");
const create_1 = __importDefault(require("./routes/create"));
require("./db/index");
const encrypt_decrypt_1 = require("./utils/encrypt-decrypt");
const get_user_1 = __importDefault(require("./routes/get-user"));
const open_position_1 = __importDefault(require("./routes/open-position"));
dotenv_1.default.config();
const { PORT, AUTH_KEY, DEVELOPMENT_ENVIRONMENT } = process.env;
const app = (0, express_1.default)();
const appWs = (0, express_ws_1.default)(app).app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use((0, cors_1.default)(cors_config_1.corsOptions));
// Connection message.
app.get("/", function (req, res) {
    res.send({ msg: "Welcome to Tradable's Backend!" });
});
appWs.ws("/", function (ws) {
    setInterval(function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Do nothing for now.
            // When set, send order book every second to frontend.
        });
    }, 1000);
    console.log("Websocket initiated!");
});
// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`);
});
// GET Endpoints.
app.use("/get-user-address", get_user_1.default);
/**
 * Middleware for all POST endpoints.
 * All post endpoints secure themselves by decrypting the API key
 * passed to the "api-key" key of the JSON object sent along side the header.
 * The decrypted value is then compared against the .env variable to
 * ensure a match. On any mismatch, the access is restricted.
 */
app.use(function (req, res, next) {
    const encryptedAPIKey = req.headers["api-key"];
    const origin = req.headers["origin"];
    // While not in development, ensure that calls are made from only the whitelisted
    // URLs.
    if (DEVELOPMENT_ENVIRONMENT == undefined) {
        if (!cors_config_1.whitelist.includes(origin)) {
            const response = { status: 403, msg: `You cannot make calls from ${origin}.` };
            res.send(response);
            return;
        }
    }
    if (encryptedAPIKey.length != 292) {
        const response = { status: 403, msg: "Invalid API Key!" };
        res.send(response);
        return;
    }
    const decryptedAPIKey = (0, encrypt_decrypt_1.decryptAPIKey)(encryptedAPIKey);
    if (AUTH_KEY !== decryptedAPIKey) {
        const response = { status: 403, msg: "Unauthorized!" };
        res.send(response);
        return;
    }
    next();
});
// POST Endpoints.
app.use("/create", create_1.default);
app.use("/open-position", open_position_1.default);
