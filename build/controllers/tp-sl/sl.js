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
const positions_1 = __importDefault(require("../../db/schema/positions"));
const close_position_1 = __importDefault(require("../close/close-position"));
/**
 * Stops loss by closing a position once the "sl" entry of the
 * position strikes `price`.
 *
 * @param price Price.
 */
function SL(price) {
    return __awaiter(this, void 0, void 0, function* () {
        const allSLs = yield positions_1.default.find({ sl: { $lte: price } });
        if (allSLs.length > 0) {
            const tpRequests = allSLs.map(function (tpPosition) {
                return __awaiter(this, void 0, void 0, function* () {
                    const [success,] = yield (0, close_position_1.default)(tpPosition.positionId);
                    return success;
                });
            });
            yield Promise.all(tpRequests);
        }
    });
}
exports.default = SL;
