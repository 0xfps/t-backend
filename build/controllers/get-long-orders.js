"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../utils/constants");
const orders_1 = __importDefault(require("../db/schema/orders"));
function getLongOrdersController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ticker } = req.params;
        const longOrders = yield orders_1.default.find({ positionType: constants_1.LONG, ticker: ticker }).sort({ time: 1 });
        if (!longOrders) {
            const response = {
                status: 200,
                msg: "OK!",
                data: {
                    body: []
                }
            };
            res.send(response);
            return;
        }
        const result = [];
        longOrders.forEach(function ({ size, price }) {
            result.push({
                size,
                price
            });
        });
        const response = {
            status: 200,
            msg: "OK!",
            data: {
                body: result
            }
        };
        res.send(response);
    });
}
exports.default = getLongOrdersController;
