import { Schema, SchemaTypes, model, models } from "mongoose"

const ordersSchema = new Schema({
    orderId: SchemaTypes.Number,
    positionType: SchemaTypes.String,   // "long" | "short"
    type: SchemaTypes.String,           // "limit" | "market"
    opener: SchemaTypes.String,
    market: SchemaTypes.String,         // BTC/USD
    leverage: SchemaTypes.Number,
    assetA: SchemaTypes.String,
    assetB: SchemaTypes.String,
    ticker: SchemaTypes.String,         // tBTC.
    size: SchemaTypes.String,
    price: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const ordersModel = models.ordersModel || model("ordersModel", ordersSchema)
export default ordersModel