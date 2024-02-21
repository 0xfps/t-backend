"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_users_open_orders_1 = __importDefault(require("../controllers/get-users-open-orders"));
const getUsersOpenOrdersRouter = (0, express_1.Router)();
getUsersOpenOrdersRouter.get("/:address", get_users_open_orders_1.default);
exports.default = getUsersOpenOrdersRouter;
