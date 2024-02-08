import { Schema, SchemaTypes, model, models } from "mongoose"

const lastPricesSchema = new Schema({
    ticker: SchemaTypes.String,
    time: SchemaTypes.Date
})

const lastPricesModel = models.lastPricesModel || model("lastPricesModel", lastPricesSchema)
export default lastPricesModel