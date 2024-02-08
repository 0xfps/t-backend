"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const create_1 = __importDefault(require("../controllers/create"));
const createRouter = (0, express_1.Router)();
createRouter.post("/", create_1.default);
exports.default = createRouter;
