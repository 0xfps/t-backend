import { Schema, SchemaTypes, model, models } from "mongoose"

const longOrdersSchema = new Schema({
    orderId: SchemaTypes.String,
    time: SchemaTypes.Date
})

const longOrdersModel = models.longOrdersModel || model("longOrdersModel", longOrdersSchema)
export default longOrdersModel