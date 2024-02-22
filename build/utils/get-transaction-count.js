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
exports.getTransactionCount = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { SNOWTRACE_API_TOKEN } = process.env;
function getTransactionCount(address) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!SNOWTRACE_API_TOKEN)
            return 0;
        const chainId = 43113;
        const network = "testnet";
        const URL = `https://api.routescan.io/v2/network/${network}/evm/${chainId}/etherscan/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${SNOWTRACE_API_TOKEN}`;
        console.log(URL);
        const req = yield fetch(URL);
        const res = yield req.json();
        console.log(res);
    });
}
exports.getTransactionCount = getTransactionCount;
