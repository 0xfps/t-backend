import { Wallet } from "ethers"

interface IWallet {
    privateKey: string,
    wallet: string
}

export default function createWallet(): IWallet {
    const newWallet = Wallet.createRandom()
    const privateKey = newWallet.privateKey
    const wallet = newWallet.address
    return { privateKey, wallet }
}