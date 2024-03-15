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
const ethers_1 = require("ethers");
const constants_1 = require("./constants");
/**
 * Returns the margin balance of a user from the TradableMarginVault. This
 * allows us to proceed or halt position creation.
 *
 * @param address User wallet address.
 * @returns number User balance, non-etherized.
 */
function getUserMarginBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = new ethers_1.ethers.JsonRpcProvider(constants_1.JSON_RPC_URL);
        const tradableSettings = new ethers_1.ethers.Contract(constants_1.TRADABLE_SETTINGS_ADDRESS, constants_1.TRADABLE_SETTINGS_ABI, provider);
        const tradableMarginVault = new ethers_1.ethers.Contract(constants_1.TRADABLE_MARGIN_VAULT_ADDRESS, constants_1.TRADABLE_MARGIN_VAULT_ABI, provider);
        const defaultDecimal = Number(yield tradableSettings.getDefaultDecimal());
        const rawBalance = Number(yield tradableMarginVault.getUserTokenBalance(address));
        return rawBalance / (10 ** defaultDecimal);
    });
}
exports.default = getUserMarginBalance;
