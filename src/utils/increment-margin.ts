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

/**
 * Increases `address`'s margin by `amount` allowing them to
 * close a position.
 * 
 * @param address   Wallet address.
 * @param amount    Amount to withdraw, non-etherized.
 * @returns Promise<boolean>
 */
export default async function incrementMargin(address: string, amount: number): Promise<boolean> {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider)
    let nonce = await provider.getTransactionCount(signer.address, "pending")

    const tradableMarginVault = new ethers.Contract(
        TRADABLE_MARGIN_VAULT_ADDRESS,
        TRADABLE_MARGIN_VAULT_ABI,
        signer
    )

    // Don't remove this.
    // const tradableMarginHandler = new ethers.Contract(
    //     TRADABLE_MARGIN_HANDLER_ADDRESS,
    //     TRADABLE_MARGIN_HANDLER_ABI,
    //     signer
    // )

    const value = BigInt(amount * (10 ** 8))

    let tx1

    let txnSuccess = false

    async function txLoop(nonce: number): Promise<boolean> {
        try {
            tx1 = await tradableMarginVault.incrementMargin(address, value, { nonce: nonce })
            // tx2 = await tradableMarginHandler.incrementMargin(address, value, { nonce: nonce + 1 })

            txnSuccess = true
            return txnSuccess
        } catch {
            return txnSuccess
        }
    }

    // Refer to src\utils\decrement-margin.ts:decrementMargin.
    while (!txnSuccess) {
        await txLoop(nonce)
        nonce = nonce + 1
    }

    if (!tx1) {
        return false
    }

    return true
}