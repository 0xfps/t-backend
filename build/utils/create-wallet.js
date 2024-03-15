"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
/**
 * Creates a new, random wallet.
 *
 * @returns {privateKey, wallet} Object containing a private key and a wallet address.
 */
function createWallet() {
    const newWallet = ethers_1.Wallet.createRandom();
    const privateKey = newWallet.privateKey;
    const wallet = newWallet.address;
    return { privateKey, wallet };
}
exports.default = createWallet;
