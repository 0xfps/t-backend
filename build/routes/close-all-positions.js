"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const close_all_positions_1 = __importDefault(require("../controllers/close-all-positions"));
const closeAllPositionsRouter = (0, express_1.Router)();
closeAllPositionsRouter.post("/", close_all_positions_1.default);
exports.default = closeAllPositionsRouter;
