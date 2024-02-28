"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const positionsSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    positionId: mongoose_1.SchemaTypes.String,
    opener: mongoose_1.SchemaTypes.String,
    positionType: mongoose_1.SchemaTypes.String, // "long" | "short"
    ticker: mongoose_1.SchemaTypes.String,
    entryPrice: mongoose_1.SchemaTypes.Number,
    liquidationPrice: mongoose_1.SchemaTypes.Number,
    tp: mongoose_1.SchemaTypes.Number || null,
    sl: mongoose_1.SchemaTypes.Number || null,
    fundingRate: mongoose_1.SchemaTypes.Number,
    time: mongoose_1.SchemaTypes.Date
});
const positionsModel = mongoose_1.models.positionsModel || (0, mongoose_1.model)("positionsModel", positionsSchema);
exports.default = positionsModel;
