"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUniqueId = void 0;
const generate_unique_id_1 = __importDefault(require("generate-unique-id"));
/**
 * Returns a unique string of length `length` that can
 * be used for an ID.
 *
 * @param length Length of ID.
 */
function getUniqueId(length = 10) {
    return (0, generate_unique_id_1.default)({
        length: length,
        includeSymbols: ["-"],
        excludeSymbols: ["/", "\\", "_", `"`, `'`]
    });
}
exports.getUniqueId = getUniqueId;
