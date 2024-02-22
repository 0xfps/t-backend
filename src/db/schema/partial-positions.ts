import { Schema, SchemaTypes, model, models } from "mongoose"

const partialPositionsSchema = new Schema({
    orderId: SchemaTypes.String,
    partialPositionId: SchemaTypes.String,
    opener: SchemaTypes.String,
    partialPositionType: SchemaTypes.String,       // "long" | "short"
    entryPrice: SchemaTypes.Number,
    liquidationPrice: SchemaTypes.Number,
    fundingRate: SchemaTypes.Number,
    isComplete: SchemaTypes.Number,
    percentageFilled: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const partialPositionsModel = models.partialPositionsModel || model("partialPositionsModel", partialPositionsSchema)
export default partialPositionsModel