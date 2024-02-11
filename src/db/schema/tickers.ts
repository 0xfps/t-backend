import { Schema, SchemaTypes, model, models } from "mongoose"

const tickersSchema = new Schema({
    ticker: SchemaTypes.String,         // tBTC.
    contractAddress: SchemaTypes.String
})

const tickersModel = models.tickersModel || model("tickersModel", tickersSchema)
export default tickersModel