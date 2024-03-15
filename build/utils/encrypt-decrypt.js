"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAPIKey = exports.decryptPrivateKey = exports.encryptPrivateKey = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { AUTH_ENCRYPTION_KEY, PRIVATE_KEY_ENCRYPTION_KEY } = process.env;
/**
 * Encryption keys used for created wallets on the /create
 * endpoint use a key different from that which is used to
 * verify api keys sent as part of POST request bodies.
 *
 * In this file, there are two sets of encryption and just
 * one decryption.
 * 1. Encryption and decryption for wallets.
 * 2. Decryption of the api keys mentioned above.
 */
const authCryptr = new cryptr_1.default(AUTH_ENCRYPTION_KEY);
const privateKeyCryptr = new cryptr_1.default(PRIVATE_KEY_ENCRYPTION_KEY);
/**
 * Encrypts a private key string.
 *
 * @param privateKey Private key.
 * @returns string Encrypted string.
 */
function encryptPrivateKey(privateKey) {
    return privateKeyCryptr.encrypt(privateKey);
}
exports.encryptPrivateKey = encryptPrivateKey;
/**
 * Decrypts an encrypted private key string.
 *
 * @param encryptedPrivateKey Private key.
 * @returns string Decrypted string, the private key.
 */
function decryptPrivateKey(encryptedPrivateKey) {
    return privateKeyCryptr.decrypt(encryptedPrivateKey);
}
exports.decryptPrivateKey = decryptPrivateKey;
/**
 * Decrypts an encrypted API key string.
 *
 * @param encryptedAPIKey API key.
 * @returns string Decrypted string, the API key.
 */
function decryptAPIKey(encryptedAPIKey) {
    return authCryptr.decrypt(encryptedAPIKey);
}
exports.decryptAPIKey = decryptAPIKey;
