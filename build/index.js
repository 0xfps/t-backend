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
const get_long_orders_1 = __importDefault(require("./routes/get-long-orders"));
const get_short_orders_1 = __importDefault(require("./routes/get-short-orders"));
const close_position_1 = __importDefault(require("./routes/close-position"));
const get_users_orders_1 = __importDefault(require("./routes/get-users-orders"));
const liquidate_position_1 = __importDefault(require("./routes/liquidate-position"));
const get_users_positions_1 = __importDefault(require("./routes/get-users-positions"));
const orders_1 = __importDefault(require("./db/schema/orders"));
const constants_1 = require("./utils/constants");
const match_limit_1 = __importDefault(require("./controllers/matcher/match-limit"));
const cancel_order_1 = __importDefault(require("./routes/cancel-order"));
const get_funding_rate_time_left_1 = __importDefault(require("./utils/get-funding-rate-time-left"));
const funding_rate_1 = __importDefault(require("./utils/funding-rate"));
const get_users_open_orders_1 = __importDefault(require("./routes/get-users-open-orders"));
const get_users_filled_orders_1 = __importDefault(require("./routes/get-users-filled-orders"));
const get_order_1 = __importDefault(require("./routes/get-order"));
const close_all_positions_1 = __importDefault(require("./routes/close-all-positions"));
dotenv_1.default.config();
const { PORT, AUTH_KEY, ENVIRONMENT_URL } = process.env;
const app = (0, express_1.default)();
const appWs = (0, express_ws_1.default)(app).app;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded());
app.use((0, cors_1.default)(cors_config_1.corsOptions));
// Connection message.
app.get("/", function (req, res) {
    res.send({ msg: "Welcome to Tradable's Backend!" });
});
appWs.ws("/", function (ws, req) {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(function () {
            ws.send("Hi there, welcome!");
        }, 1000);
    });
});
appWs.ws("/hi/:ty", function (ws, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ty } = req.params;
        setInterval(function () {
            ws.send(`Hi there, welcome, ${ty}!`);
        }, 1000);
    });
});
appWs.ws("/market-data/:ticker", function (ws, req) {
    return __awaiter(this, void 0, void 0, function* () {
        const URL = ENVIRONMENT_URL ? ENVIRONMENT_URL : "http://localhost:8080";
        const { ticker } = req.params;
        setInterval(function () {
            return __awaiter(this, void 0, void 0, function* () {
                // Do nothing for now.
                // When set, send order book every second to frontend.
                const shortsRequest = yield fetch(`${URL}/get-short-orders/${ticker}`, {
                    method: constants_1.GET
                });
                const longsRequest = yield fetch(`${URL}/get-long-orders/${ticker}`, {
                    method: constants_1.GET
                });
                const longs = yield longsRequest.json();
                const shorts = yield shortsRequest.json();
                const data = {
                    longs: longs.data.body,
                    shorts: shorts.data.body
                };
                ws.send(JSON.stringify(data));
            });
        }, 1000);
        // Make a call to an endpoint that compares long orders to short orders
        // every 5 seconds and tries to match them.
        // This can be the idea of an orderbook.
        // I don't know if this can function as a matching engine.
        setInterval(function () {
            return __awaiter(this, void 0, void 0, function* () {
                // Do nothing for now.
                // When set, send order book every second to frontend.
                const allLongLimitOrders = yield orders_1.default.find({ type: constants_1.MARKET, positionType: constants_1.LONG, filled: false }).sort({ time: 1, price: -1 });
                const allShortLimitOrders = yield orders_1.default.find({ type: constants_1.MARKET, positionType: constants_1.SHORT, filled: false }).sort({ time: 1, price: -1 });
                yield (0, match_limit_1.default)(allLongLimitOrders, allShortLimitOrders);
            });
        }, 5000);
        setInterval(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, funding_rate_1.default)(ticker);
            });
        }, yield (0, get_funding_rate_time_left_1.default)(ticker));
        console.log("Websocket initiated!");
    });
});
// Start server.
app.listen(PORT, function () {
    console.info(`Server started on port ${PORT}.`);
});
// GET Endpoints.
app.use("/get-user-address", get_user_1.default);
app.use("/get-order", get_order_1.default);
app.use("/get-long-orders", get_long_orders_1.default);
app.use("/get-short-orders", get_short_orders_1.default);
app.use("/get-users-orders", get_users_orders_1.default);
app.use("/get-users-open-orders", get_users_open_orders_1.default);
app.use("/get-users-filled-orders", get_users_filled_orders_1.default);
app.use("/get-users-positions", get_users_positions_1.default);
/**
 * Middleware for all POST endpoints.
 * All post endpoints secure themselves by decrypting the API key
 * passed to the "api-key" key of the JSON object sent along side the header.
 * The decrypted value is then compared against the .env variable to
 * ensure a match. On any mismatch, the access is restricted.
 */
app.use(function (req, res, next) {
    const encryptedAPIKey = req.headers["api-key"];
    // 🚨 I removed this for testing.
    // const origin = req.headers["origin"]
    // While not in development, ensure that calls are made from only the whitelisted
    // URLs.
    // if (DEVELOPMENT_ENVIRONMENT == undefined) {
    //     if (!whitelist.includes(origin as string)) {
    //         const response: ResponseInterface = { status: 403, msg: `You cannot make calls from ${origin}.` }
    //         res.send(response)
    //         return
    //     }
    // }
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
app.use("/close-position", close_position_1.default);
app.use("/close-all-positions", close_all_positions_1.default);
app.use("/cancel-order", cancel_order_1.default);
app.use("/liquidate-position", liquidate_position_1.default);
