import { ethers } from "ethers";
import {
    JSON_RPC_URL,
    TRADABLE_MARGIN_HANDLER_ABI,
    TRADABLE_MARGIN_HANDLER_ADDRESS,
    TRADABLE_MARGIN_VAULT_ABI,
    TRADABLE_MARGIN_VAULT_ADDRESS
} from "./constants";

export default async function incrementMargin(address: string, amount: number): Promise<boolean> {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
    const tradableMarginVault = new ethers.Contract(
        TRADABLE_MARGIN_VAULT_ADDRESS,
        TRADABLE_MARGIN_VAULT_ABI,
        provider
    )

    const tradableMarginHandler = new ethers.Contract(
        TRADABLE_MARGIN_HANDLER_ADDRESS,
        TRADABLE_MARGIN_HANDLER_ABI,
        provider
    )

    const value = BigInt(amount * (10 ** 8))
    const tx1 = await tradableMarginVault.incrementMargin(address, value)
    const tx2 = await tradableMarginHandler.incrementMargin(address, value)

    if (!tx1 || !tx2) {
        return false
    }

    return true
}