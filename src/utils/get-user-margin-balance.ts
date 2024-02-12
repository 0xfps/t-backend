import { ethers } from "ethers";
import { JSON_RPC_URL } from "./constants"
import contracts from "../config/contracts.json"

export default async function getUserMarginBalance(address: string): Promise<number> {
    const provider = new ethers.JsonRpcProvider(JSON_RPC_URL)
    const tradableSettings = new ethers.Contract(
        contracts.tradableSettings.address,
        contracts.tradableSettings.abi,
        provider
    )
    const tradableMarginVault = new ethers.Contract(
        contracts.tradableMarginVault.address,
        contracts.tradableMarginVault.abi,
        provider
    )

    const defaultDecimal = Number(await tradableSettings.getDefaultDecimal())
    const rawBalance = Number(await tradableMarginVault.getUserTokenBalance(address))

    return rawBalance / (10 ** defaultDecimal)
}