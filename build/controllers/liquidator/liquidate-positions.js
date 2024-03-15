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
exports.liquidatePositions = void 0;
const close_position_1 = __importDefault(require("../close/close-position"));
/**
 * Liquidates a set of positions, packing the results of the liquidation
 * in an array. If any position doesn't liquidate properly, it returns false.
 * Otherwise returning true.
 *
 * @param positions An array of positions to be liquidated.
 */
function liquidatePositions(positions) {
    return __awaiter(this, void 0, void 0, function* () {
        positions.forEach(function ({ positionId }) {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, close_position_1.default)(positionId);
            });
        });
    });
}
exports.liquidatePositions = liquidatePositions;
