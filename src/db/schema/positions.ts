import { Schema, SchemaTypes, model, models } from "mongoose"

const positionsSchema = new Schema({
    orderId: SchemaTypes.String,
    positionId: SchemaTypes.String,
    positionType: SchemaTypes.String,       // "long" | "short"
    entryPrice: SchemaTypes.Number,
    liquidationPrice: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const positionsModel = models.positionsModel || model("positionsModel", positionsSchema)
export default positionsModel