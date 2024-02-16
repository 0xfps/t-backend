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
Object.defineProperty(exports, "__esModule", { value: true });
function liquidatePositionController(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { positionId } = req.body;
        const body = {
            positionId: positionId
        };
        const liquidationCall = yield fetch("http://localhost:8080/close-position", {
            method: "POST",
            headers: {
                "api-key": (_a = process.env.ENCRYPTED_DEVELOPMENT_API_KEY) !== null && _a !== void 0 ? _a : process.env.ENCRYPTED_PRODUCTION_API_KEY
            },
            body: JSON.stringify(body)
        });
        const response = yield liquidationCall.json();
    });
}
exports.default = liquidatePositionController;
