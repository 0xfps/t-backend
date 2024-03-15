import { Wallet } from "ethers"

interface IWallet {
    privateKey: string,
    wallet: string
}

/**
 * Creates a new, random wallet.
 * 
 * @returns {privateKey, wallet} Object containing a private key and a wallet address.
 */
export default function createWallet(): IWallet {
    const newWallet = Wallet.createRandom()
    const privateKey = newWallet.privateKey
    const wallet = newWallet.address
    return { privateKey, wallet }
}