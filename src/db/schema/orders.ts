import { Schema, SchemaTypes, model, models } from "mongoose"

const ordersSchema = new Schema({
    orderId: SchemaTypes.String,
    aoriOrderId: SchemaTypes.String,
    // Order object starts here.
    positionType: SchemaTypes.String,   // "long" | "short"
    type: SchemaTypes.String,           // "limit" | "market"
    opener: SchemaTypes.String,
    market: SchemaTypes.String,         // BTC/USD
    margin: SchemaTypes.Number,
    leverage: SchemaTypes.Number,
    assetA: SchemaTypes.String,
    assetB: SchemaTypes.String,
    ticker: SchemaTypes.String,         // tBTC.
    size: SchemaTypes.String,
    price: SchemaTypes.Number,
    // Ends here.
    // Orders that filled this order.
    filled: SchemaTypes.Boolean,
    fillingOrders: SchemaTypes.Array,
    time: SchemaTypes.Date
})

const ordersModel = models.ordersModel || model("ordersModel", ordersSchema)
export default ordersModel