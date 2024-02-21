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
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function decrementMargin(address, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(constants_1.JSON_RPC_URL);
        const signer = new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const tradableMarginVault = new ethers_1.ethers.Contract(constants_1.TRADABLE_MARGIN_VAULT_ADDRESS, constants_1.TRADABLE_MARGIN_VAULT_ABI, signer);
        const tradableMarginHandler = new ethers_1.ethers.Contract(constants_1.TRADABLE_MARGIN_HANDLER_ADDRESS, constants_1.TRADABLE_MARGIN_HANDLER_ABI, signer);
        const value = BigInt(amount * (10 ** 8));
        const tx1 = yield tradableMarginVault.decrementMargin.populateTransaction(address, value);
        const tx2 = yield tradableMarginHandler.decrementMargin.populateTransaction(address, value);
        yield signer.sendTransaction(tx1);
        yield signer.sendTransaction(tx2);
        if (!tx1 || !tx2) {
            return false;
        }
        return true;
    });
}
exports.default = decrementMargin;
