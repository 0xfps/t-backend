"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cancel_all_orders_1 = __importDefault(require("../controllers/cancel-all-orders"));
const cancelAllOrdersRouter = (0, express_1.Router)();
cancelAllOrdersRouter.post("/", cancel_all_orders_1.default);
exports.default = cancelAllOrdersRouter;
