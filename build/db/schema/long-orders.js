"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const longOrdersSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    time: mongoose_1.SchemaTypes.Date
});
const longOrdersModel = mongoose_1.models.longOrdersModel || (0, mongoose_1.model)("longOrdersModel", longOrdersSchema);
exports.default = longOrdersModel;
