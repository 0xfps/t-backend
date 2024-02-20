"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const fundingRatesSchema = new mongoose_1.Schema({
    ticker: mongoose_1.SchemaTypes.String,
    timeOfLastFunding: mongoose_1.SchemaTypes.Date
});
const fundingRatesModel = mongoose_1.models.fundingRatesModel || (0, mongoose_1.model)("fundingRatesModel", fundingRatesSchema);
exports.default = fundingRatesModel;
