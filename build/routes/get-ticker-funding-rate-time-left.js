"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_ticker_funding_rate_time_left_1 = __importDefault(require("../controllers/get-ticker-funding-rate-time-left"));
const getTickerFundingRateTimeLeftRouter = (0, express_1.Router)();
getTickerFundingRateTimeLeftRouter.get("/:ticker", get_ticker_funding_rate_time_left_1.default);
exports.default = getTickerFundingRateTimeLeftRouter;
