import { Schema, SchemaTypes, model, models } from "mongoose"

const userAddressesSchema = new Schema({
    user: SchemaTypes.String,
    tWallet: SchemaTypes.String,
    privateKey: SchemaTypes.String,
    time_created: SchemaTypes.Date
})

const userAddressesModel = models.userAddressesModel || model("userAddressesModel", userAddressesSchema)
export default userAddressesModel