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
const user_addreses_1 = __importDefault(require("../db/schema/user-addreses"));
const increment_margin_1 = __importDefault(require("../utils/increment-margin"));
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
        const { user } = yield user_addreses_1.default.findOne({ tWallet: orderEntry.opener });
        // 💡 Increment user's margin.
        const incremented = yield (0, increment_margin_1.default)(user, orderEntry.margin);
        if (!incremented) {
            const response = {
                status: 400,
                msg: "Could not increment your margin!"
            };
            res.send(response);
            return;
        }
        const deleteOrder = yield orders_1.default.updateOne({ orderId: orderId }, { deleted: true });
        if (!deleteOrder) {
            const response = {
                status: 400,
                msg: "Order could not be deleted!"
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: "Order deleted!"
        };
        res.send(response);
    });
}
exports.default = cancelOrderController;
