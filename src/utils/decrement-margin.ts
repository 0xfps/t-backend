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
 * Reduces `address`'s margin by `amount` allowing them to
 * create a position.
 * 
 * @param address   Wallet address.
 * @param amount    Amount to withdraw, non-etherized.
 * @returns Promise<boolean>
 */
export default async function decrementMargin(address: string, amount: number): Promise<boolean> {
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
            tx1 = await tradableMarginVault.decrementMargin(address, value, { nonce: nonce })
            // tx2 = await tradableMarginHandler.decrementMargin(address, value, { nonce: nonce + 1 })

            txnSuccess = true
            return txnSuccess
        } catch {
            return txnSuccess
        }
    }

    /**
     * While developing on Avalanche, there is an issue of transactions
     * failing as a result of used nonces. Incrementing these nonces by numbers
     * far above a certain point resulted in more failed transactions, and at a 
     * point, there will be a situation where the developer doesn't know which
     * nonces have been used and which haven't.
     * 
     * The trick is to make repetitive smart contract calls via try/catch in the
     * `txLoop()` function starting with the current nonce. A successful call with an
     * unused nonce returns true, and the contract calls are ended. A call that throws
     * an error returns false and the transaction is sent again with a higher nonce than
     * the initial one.
     */
    while (!txnSuccess) {
        await txLoop(nonce)
        nonce = nonce + 1
    }

    if (!tx1) {
        return false
    }

    return true
}