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
function cancelOrderController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { orderId } = req.body;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            const response = {
                status: 404,
                msg: "Order not found!"
            };
            res.send(response);
            return;
        }
        if (orderEntry.filled == true || (orderEntry.fillingOrders).length > 0) {
            const response = {
                status: 400,
                msg: "Can't delete order as it is getting filled!"
            };
            res.send(response);
            return;
        }
        const deleteOrder = orders_1.default.deleteOne({ orderId: orderId });
        if (!deleteOrder) {
            const response = {
                status: 400,
                msg: "Order could not be deleted!"
            };
            res.send(response);
            return;
        }
        // Refund
        const response = {
            status: 200,
            msg: "Order deleted!"
        };
        res.send(response);
    });
}
exports.default = cancelOrderController;
