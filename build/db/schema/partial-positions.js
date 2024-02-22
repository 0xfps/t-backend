"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const partialPositionsSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    partialPositionId: mongoose_1.SchemaTypes.String,
    opener: mongoose_1.SchemaTypes.String,
    partialPositionType: mongoose_1.SchemaTypes.String, // "long" | "short"
    entryPrice: mongoose_1.SchemaTypes.Number,
    liquidationPrice: mongoose_1.SchemaTypes.Number,
    fundingRate: mongoose_1.SchemaTypes.Number,
    isComplete: mongoose_1.SchemaTypes.Number,
    percentageFilled: mongoose_1.SchemaTypes.Number,
    time: mongoose_1.SchemaTypes.Date
});
const partialPositionsModel = mongoose_1.models.partialPositionsModel || (0, mongoose_1.model)("partialPositionsModel", partialPositionsSchema);
exports.default = partialPositionsModel;
