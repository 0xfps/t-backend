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
const get_funding_rate_time_left_1 = __importDefault(require("../utils/get-funding-rate-time-left"));
/**
 * Funding rates are charged every 8 hours. This function returns the 8 hour difference
 * between the last funding rate time and the next funding rate.
 *
 * @param req Request.
 * @param res Response.
 */
function getTickerFundingRateTimeLeftController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ticker } = req.params;
        const timeLeft = yield (0, get_funding_rate_time_left_1.default)(ticker);
        const response = {
            status: 200,
            msg: "OK",
            data: {
                timeLeft: timeLeft
            }
        };
        res.send(response);
    });
}
exports.default = getTickerFundingRateTimeLeftController;
