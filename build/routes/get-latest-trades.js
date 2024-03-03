"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_latest_trades_1 = __importDefault(require("../controllers/get-latest-trades"));
const getLatestTradesRouter = (0, express_1.Router)();
getLatestTradesRouter.get("/:ticker/:size", get_latest_trades_1.default);
exports.default = getLatestTradesRouter;
