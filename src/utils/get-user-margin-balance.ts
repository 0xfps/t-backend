import { ethers } from "ethers";
import {
    JSON_RPC_URL,
    TRADABLE_MARGIN_VAULT_ABI,
    TRADABLE_MARGIN_VAULT_ADDRESS,
    TRADABLE_SETTINGS_ABI,
    TRADABLE_SETTINGS_ADDRESS
} from "./constants"

/**
 * Returns the margin balance of a user from the TradableMarginVault. This
 * allows us to proceed or halt position creation.
 * 
 * @param address User wallet address.
 * @returns number User balance, non-etherized.
 */
export default async function getUserMarginBalance(address: string): Promise<number> {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
    const tradableSettings = new ethers.Contract(
        TRADABLE_SETTINGS_ADDRESS,
        TRADABLE_SETTINGS_ABI,
        provider
    )
    const tradableMarginVault = new ethers.Contract(
        TRADABLE_MARGIN_VAULT_ADDRESS,
        TRADABLE_MARGIN_VAULT_ABI,
        provider
    )

    const defaultDecimal = Number(await tradableSettings.getDefaultDecimal())
    const rawBalance = Number(await tradableMarginVault.getUserTokenBalance(address))

    return rawBalance / (10 ** defaultDecimal)
}