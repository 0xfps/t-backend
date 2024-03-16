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
const user_addreses_1 = __importDefault(require("../db/schema/user-addreses"));
const orders_1 = __importDefault(require("../db/schema/orders"));
/**
 * Cancels all orders opened by `address` that aren't being filled.
 * We don't care about the ticker. Delete everything as long as
 * the fillingOrders property of the database is empty [] and
 * filled is still false.
 *
 * @param req Request.
 * @param res Response.
 */
function cancelAllOrdersController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { address } = req.body;
        if (!address) {
            const response = {
                status: 404,
                msg: "Address not passed!"
            };
            res.send(response);
            return;
        }
        const addressEntry = yield user_addreses_1.default.findOne({ user: address });
        if (!addressEntry) {
            const response = {
                status: 404,
                msg: "Address not found!"
            };
            res.send(response);
            return;
        }
        const tWallet = addressEntry.tWallet;
        const deletion = orders_1.default.deleteMany({
            opener: tWallet,
            filled: false,
            fillingOrders: [],
        });
        if (!deletion) {
            const response = {
                status: 400,
                msg: "Could not delete orders!"
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: "Orders deleted!"
        };
        res.send(response);
    });
}
exports.default = cancelAllOrdersController;
