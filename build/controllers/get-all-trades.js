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
 * Returns all positions on the exchange for a ticker.
 *
 * @param req Request.
 * @param res Response.
 */
function getAllTradesController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ticker } = req.params;
        const latestTrades = yield positions_1.default.find({ ticker: ticker }).sort({ time: "descending" });
        const response = {
            status: 200,
            msg: "OK!",
            data: latestTrades
        };
        res.send(response);
    });
}
exports.default = getAllTradesController;
