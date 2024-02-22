import { Schema, SchemaTypes, model, models } from "mongoose"

const noncesSchema = new Schema({
    id: SchemaTypes.String,
    nonce: SchemaTypes.Number
})

const noncesModel = models.noncesModel || model("noncesModel", noncesSchema)
export default noncesModel