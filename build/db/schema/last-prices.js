"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const lastPricesSchema = new mongoose_1.Schema({
    ticker: mongoose_1.SchemaTypes.String,
    time: mongoose_1.SchemaTypes.Date
});
const lastPricesModel = mongoose_1.models.lastPricesModel || (0, mongoose_1.model)("lastPricesModel", lastPricesSchema);
exports.default = lastPricesModel;
