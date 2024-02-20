"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_long_orders_1 = __importDefault(require("../controllers/get-long-orders"));
const getLongOrdersRouter = (0, express_1.Router)();
getLongOrdersRouter.get("/:ticker", get_long_orders_1.default);
exports.default = getLongOrdersRouter;
