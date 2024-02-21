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
const orders_1 = __importDefault(require("../db/schema/orders"));
function getOrderController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { orderId } = req.params;
        const order = yield orders_1.default.find({ orderId: orderId }).sort({ time: 1 });
        if (!order) {
            const response = {
                status: 404,
                msg: "Not found!",
                data: {}
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: "OK!",
            data: order
        };
        res.send(response);
    });
}
exports.default = getOrderController;