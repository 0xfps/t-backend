import { Schema, SchemaTypes, model, models } from "mongoose"

const fundingRatesSchema = new Schema({
    ticker: SchemaTypes.String,
    timeOfLastFunding: SchemaTypes.Date
})

const fundingRatesModel = models.fundingRatesModel || model("fundingRatesModel", fundingRatesSchema)
export default fundingRatesModel