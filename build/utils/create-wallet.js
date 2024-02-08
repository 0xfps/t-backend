"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
function createWallet() {
    const newWallet = ethers_1.Wallet.createRandom();
    const privateKey = newWallet.privateKey;
    const wallet = newWallet.address;
    return { privateKey, wallet };
}
exports.default = createWallet;
