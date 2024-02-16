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
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("../utils/constants");
dotenv_1.default.config();
const { ENCRYPTED_DEVELOPMENT_API_KEY, ENCRYPTED_PRODUCTION_API_KEY, ENVIRONMENT_URL } = process.env;
const URL = ENVIRONMENT_URL ? ENVIRONMENT_URL : "http://localhost:8080";
function liquidatePositionController(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { positionId } = req.body;
        const body = {
            positionId: positionId
        };
        const liquidationCall = yield fetch(`${URL}/close-position`, {
            method: constants_1.POST,
            headers: {
                "api-key": (_a = ENCRYPTED_DEVELOPMENT_API_KEY) !== null && _a !== void 0 ? _a : ENCRYPTED_PRODUCTION_API_KEY
            },
            body: JSON.stringify(body)
        });
        const resp = yield liquidationCall.json();
        if (resp.status != 200) {
            const response = {
                status: resp.status,
                msg: "Error"
            };
            res.send(response);
            return;
        }
        const response = {
            status: resp.status,
            msg: resp.msg,
            data: resp.data
        };
        res.send(response);
    });
}
exports.default = liquidatePositionController;
