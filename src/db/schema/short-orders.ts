import { Schema, SchemaTypes, model, models } from "mongoose"

const shortOrdersSchema = new Schema({
    orderId: SchemaTypes.Number,
    time: SchemaTypes.Date
})

const shortOrdersModel = models.shortOrdersModel || model("shortOrdersModel", shortOrdersSchema)
export default shortOrdersModel