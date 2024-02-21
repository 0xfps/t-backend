import { ethers } from "ethers";
import {
    JSON_RPC_URL,
    TRADABLE_MARGIN_HANDLER_ABI,
    TRADABLE_MARGIN_HANDLER_ADDRESS,
    TRADABLE_MARGIN_VAULT_ABI,
    TRADABLE_MARGIN_VAULT_ADDRESS
} from "./constants";
import dotenv from "dotenv"

dotenv.config()

export default async function decrementMargin(address: string, amount: number): Promise<boolean> {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)
    const nonce = await provider.getTransactionCount(signer.address)

    const tradableMarginVault = new ethers.Contract(
        TRADABLE_MARGIN_VAULT_ADDRESS,
        TRADABLE_MARGIN_VAULT_ABI,
        signer
    )

    const tradableMarginHandler = new ethers.Contract(
        TRADABLE_MARGIN_HANDLER_ADDRESS,
        TRADABLE_MARGIN_HANDLER_ABI,
        signer
    )

    const value = BigInt(amount * (10 ** 8))

    const tx1 = await tradableMarginVault.decrementMargin.populateTransaction(address, value)
    const tx2 = await tradableMarginHandler.decrementMargin.populateTransaction(address, value)

    await (await signer.sendTransaction({ ...tx1, nonce: nonce + 30 })).wait()
    await (await signer.sendTransaction({ ...tx2, nonce: nonce + 40 })).wait()

    await signer.sendTransaction(tx1)
    await signer.sendTransaction(tx2)

    if (!tx1 || !tx2) {
        return false
    }

    return true
}