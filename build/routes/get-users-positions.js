"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_users_positions_1 = __importDefault(require("../controllers/get-users-positions"));
const getUsersPositionsRouter = (0, express_1.Router)();
getUsersPositionsRouter.get("/:address", get_users_positions_1.default);
exports.default = getUsersPositionsRouter;
