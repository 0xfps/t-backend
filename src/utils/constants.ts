import config from "../config/contracts.json"

// Position types.
export const LONG = "long"
export const SHORT = "short"

// Order types.
export const LIMIT = "limit"
export const MARKET = "market"

export type Types = "limit" | "market"
export type PositionTypes = "long" | "short"

export const GET = "GET"
export const POST = "GET"

// Maximum slippage percentage allowed for long and short positions.
// 2%, in this case.
export const SPREAD = 2

export const EIGHT_HOURS = 1000 * 60 * 60 * 8
export const BINANCE_API = "https://api.binance.com"

export type Order = {
    positionType: PositionTypes,
    type: Types,
    opener: string,
    market: string,
    leverage: number,
    margin: number,
    fee: number,
    assetA: string,
    assetB: string,
    ticker: string,
    size: number,
    price: number
}

export const JSON_RPC_URL = "https://rpc.ankr.com/avalanche_fuji"

export const TRADABLE_MARGIN_VAULT_ABI = config.tradableMarginVault.abi
export const TRADABLE_MARGIN_VAULT_ADDRESS = config.tradableMarginVault.address

export const TRADABLE_SETTINGS_ABI = config.tradableSettings.abi
export const TRADABLE_SETTINGS_ADDRESS = config.tradableSettings.address

export const TRADABLE_MARGIN_HANDLER_ABI = config.tradableMarginHandler.abi
export const TRADABLE_MARGIN_HANDLER_ADDRESS = config.tradableMarginHandler.address