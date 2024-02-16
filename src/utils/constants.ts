// Position types.
export const LONG = "long"
export const SHORT = "short"

// Order types.
export const LIMIT = "limit"
export const MARKET = "market"

export type Types = "limit" | "market"
export type PositionTypes = "long" | "short"

// Maximum slippage percentage allowed for long and short positions.
// 2%, in this case.
export const SPREAD = 2

export type Order = {
    positionType: PositionTypes,
    type: Types,
    opener: string,
    market: string,
    leverage: number,
    margin: number,
    assetA: string,
    assetB: string,
    ticker: string,
    size: number,
    price: number,
    time: number
}

export const JSON_RPC_URL = "https://goerli.gateway.tenderly.co"
