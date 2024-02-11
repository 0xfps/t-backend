"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const shortOrdersSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    time: mongoose_1.SchemaTypes.Date
});
const shortOrdersModel = mongoose_1.models.shortOrdersModel || (0, mongoose_1.model)("shortOrdersModel", shortOrdersSchema);
exports.default = shortOrdersModel;
