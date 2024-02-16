"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const liquidate_position_1 = __importDefault(require("../controllers/liquidate-position"));
const liquidatePositionRouter = (0, express_1.Router)();
liquidatePositionRouter.post("/", liquidate_position_1.default);
exports.default = liquidatePositionRouter;
