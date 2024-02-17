"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cancel_order_1 = __importDefault(require("../controllers/cancel-order"));
const cancelOrderRouter = (0, express_1.Router)();
cancelOrderRouter.post("/", cancel_order_1.default);
exports.default = cancelOrderRouter;
