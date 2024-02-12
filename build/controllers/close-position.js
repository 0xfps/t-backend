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
const positions_1 = __importDefault(require("../db/schema/positions"));
const orders_1 = __importDefault(require("../db/schema/orders"));
/**
 * Closes a position specified by the positionId.
 *
 * @param req Request.
 * @param res Response.
 */
function closePositionController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { positionId } = req.body;
        // I think there maybe should be some sort of authorization
        // to validate the call to this endpoint in order to avoid
        // wrong calls.
        const positionEntry = yield positions_1.default.findOne({ positionId: positionId });
        if (!positionEntry) {
            const response = {
                status: 404,
                msg: "Position not found!"
            };
            res.send(response);
        }
        const { type, orderId } = positionEntry.positionType;
        const orderEntry = yield orders_1.default.findOne({ orderId: orderId });
        if (!orderEntry) {
            const response = {
                status: 404,
                msg: "Order not found for position!"
            };
            res.send(response);
        }
        // Continue.
        // if (type == LONG) await processLongMarketOrder
    });
}
exports.default = closePositionController;
