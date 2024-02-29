import { Schema, SchemaTypes, model, models } from "mongoose"

const positionsSchema = new Schema({
    orderId: SchemaTypes.String,
    positionId: SchemaTypes.String,
    opener: SchemaTypes.String,
    positionType: SchemaTypes.String,       // "long" | "short"
    ticker: SchemaTypes.String,
    entryPrice: SchemaTypes.Number,
    liquidationPrice: SchemaTypes.Number,
    tp: SchemaTypes.Number,
    sl: SchemaTypes.Number,
    openingMargin: SchemaTypes.Number,
    fundingRate: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const positionsModel = models.positionsModel || model("positionsModel", positionsSchema)
export default positionsModel