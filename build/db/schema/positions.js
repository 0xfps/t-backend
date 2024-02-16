"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const positionsSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    positionId: mongoose_1.SchemaTypes.String,
    positionType: mongoose_1.SchemaTypes.String, // "long" | "short"
    entryPrice: mongoose_1.SchemaTypes.Number,
    liquidationPrice: mongoose_1.SchemaTypes.Number,
    time: mongoose_1.SchemaTypes.Date
});
const positionsModel = mongoose_1.models.positionsModel || (0, mongoose_1.model)("positionsModel", positionsSchema);
exports.default = positionsModel;
