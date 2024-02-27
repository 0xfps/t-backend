"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const add_tp_sl_1 = __importDefault(require("../controllers/add-tp-sl"));
const addTPAndSLRouter = (0, express_1.Router)();
addTPAndSLRouter.post("/", add_tp_sl_1.default);
exports.default = addTPAndSLRouter;
