"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_users_orders_1 = __importDefault(require("../controllers/get-users-orders"));
const getUsersOrdersRouter = (0, express_1.Router)();
getUsersOrdersRouter.get("/:address", get_users_orders_1.default);
exports.default = getUsersOrdersRouter;
