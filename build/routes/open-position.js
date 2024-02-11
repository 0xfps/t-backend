"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const open_position_1 = __importDefault(require("../controllers/open-position"));
const openPositionRouter = (0, express_1.Router)();
openPositionRouter.post("/", open_position_1.default);
exports.default = openPositionRouter;
