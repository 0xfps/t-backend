"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_short_orders_1 = __importDefault(require("../controllers/get-short-orders"));
const getShortOrdersRouter = (0, express_1.Router)();
getShortOrdersRouter.get("/", get_short_orders_1.default);
exports.default = getShortOrdersRouter;
