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
const close_position_1 = __importDefault(require("./close/close-position"));
/**
 * Closes a position specified by the positionId. Liquidating a positions is
 * simply force-closing the position.
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
        const [success, reason] = yield (0, close_position_1.default)(positionId);
        if (!success) {
            const response = {
                status: 400,
                msg: reason
            };
            res.send(response);
            return;
        }
        const response = {
            status: 200,
            msg: reason
        };
        res.send(response);
    });
}
exports.default = closePositionController;
