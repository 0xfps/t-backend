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
exports.manageNonce = void 0;
const nonces_1 = __importDefault(require("../db/schema/nonces"));
function manageNonce(defaultNonce) {
    return __awaiter(this, void 0, void 0, function* () {
        const nonces = yield nonces_1.default.find({ id: "mynonce" });
        console.log(defaultNonce);
        if (nonces.length == 0) {
            yield nonces_1.default.create({ id: "mynonce", nonce: defaultNonce + 1 });
            return defaultNonce + 5;
        }
        const nonceToUse = nonces[0].nonce + 5;
        yield nonces_1.default.updateOne({ id: "mynonce" }, { nonce: nonceToUse + 6 });
        console.log(nonceToUse);
        return nonceToUse;
    });
}
exports.manageNonce = manageNonce;
