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
function addTPAndSLController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { positionId, tp, sl } = req.body;
        if (!positionId) {
            const response = {
                status: 400,
                msg: "No position id specified."
            };
            res.send(response);
            return;
        }
        const positionExists = yield positions_1.default.findOne({ positionId: positionId });
        if (!positionExists) {
            const response = {
                status: 404,
                msg: "Position not found."
            };
            res.send(response);
            return;
        }
        const positionUpdated = yield positions_1.default.updateOne({ positionId: positionId }, {
            tp: parseFloat(tp.toFixed(4)),
            sl: parseFloat(sl.toFixed(4)),
        });
        if (!positionUpdated) {
            const response = {
                status: 400,
                msg: "Position TP/SL not updated."
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: "Position TP/SL set."
        };
        res.send(response);
    });
}
exports.default = addTPAndSLController;
