"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const close_position_1 = __importDefault(require("../controllers/close-position"));
const closePositionRouter = (0, express_1.Router)();
closePositionRouter.post("/", close_position_1.default);
exports.default = closePositionRouter;
