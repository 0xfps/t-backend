import { Schema, SchemaTypes, model, models } from "mongoose"

const pendingOrdersSchema = new Schema({
    order: {
        type: Object,
        default: {}
    },
    time: SchemaTypes.Date
})

const pendingOrdersModel = models.pendingOrdersModel || model("pendingOrdersModel", pendingOrdersSchema)
export default pendingOrdersModel