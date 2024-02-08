import { Schema, SchemaTypes, model, models } from "mongoose"

const positonsSchema = new Schema({
    orderId: SchemaTypes.Number,
    positionId: SchemaTypes.Number,
    positionType: SchemaTypes.String,       // "long" | "short"
    entryPrice: SchemaTypes.Number,
    liquidationPrice: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const positonsModel = models.positonsModel || model("positonsModel", positonsSchema)
export default positonsModel