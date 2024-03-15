import Cryptr from "cryptr"
import dotenv from "dotenv"

dotenv.config()

const { AUTH_ENCRYPTION_KEY, PRIVATE_KEY_ENCRYPTION_KEY } = process.env

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

const authCryptr = new Cryptr(AUTH_ENCRYPTION_KEY as string)
const privateKeyCryptr = new Cryptr(PRIVATE_KEY_ENCRYPTION_KEY as string)

/**
 * Encrypts a private key string.
 * 
 * @param privateKey Private key.
 * @returns string Encrypted string.
 */
export function encryptPrivateKey(privateKey: string): string {
    return privateKeyCryptr.encrypt(privateKey)
}

/**
 * Decrypts an encrypted private key string.
 * 
 * @param encryptedPrivateKey Private key.
 * @returns string Decrypted string, the private key.
 */
export function decryptPrivateKey(encryptedPrivateKey: string): string {
    return privateKeyCryptr.decrypt(encryptedPrivateKey)
}

/**
 * Decrypts an encrypted API key string.
 * 
 * @param encryptedAPIKey API key.
 * @returns string Decrypted string, the API key.
 */
export function decryptAPIKey(encryptedAPIKey: string): string {
    return authCryptr.decrypt(encryptedAPIKey)
}