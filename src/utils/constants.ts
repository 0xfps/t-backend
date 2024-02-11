// Position types.
export const LONG = "long"
export const SHORT = "short"

// Order types.
export const LIMIT = "limit"
export const MARKET = "market"

export type Types = "limit" | "market"
export type PositionTypes = "long" | "short"

export type Order = {
    positionType: PositionTypes,
    type: Types,
    opener: string,
    market: string,
    leverage: number,
    assetA: string,
    assetB: string,
    ticker: string,
    size: number,
    price: number,
    time: number
}