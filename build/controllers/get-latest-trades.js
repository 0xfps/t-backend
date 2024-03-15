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
const positions_1 = __importDefault(require("../db/schema/positions"));
/**
 * Returns a specified number of recent positions opened for a ticker.
 * ticker and size are specified when calling the endpoint. Ticker,
 * stating what market to get data from and size denoting now much
 * is to be returned.
 *
 * @param req Request.
 * @param res Response.
 */
function getLatestTradesController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ticker, size } = req.params;
        const latestTrades = yield positions_1.default.find({ ticker: ticker }).sort({ time: "descending" });
        if (latestTrades.length == 0) {
            const response = {
                status: 400,
                msg: "No trades yet.",
                data: []
            };
            res.send(response);
            return;
        }
        let lastNTrades = [];
        if (latestTrades.length > parseInt(size))
            lastNTrades = latestTrades.slice(0, parseInt(size) + 1);
        else
            lastNTrades = latestTrades;
        const response = {
            status: 200,
            msg: "OK!",
            data: lastNTrades
        };
        res.send(response);
    });
}
exports.default = getLatestTradesController;
