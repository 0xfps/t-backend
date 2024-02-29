"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_ticker_information_1 = require("../controllers/get-ticker-information");
const getTickerInformationRouter = (0, express_1.Router)();
getTickerInformationRouter.get("/:ticker", get_ticker_information_1.getTickerInformationController);
exports.default = getTickerInformationRouter;
