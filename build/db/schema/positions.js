"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const positonsSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.Number,
    positionId: mongoose_1.SchemaTypes.Number,
    positionType: mongoose_1.SchemaTypes.String, // "long" | "short"
    entryPrice: mongoose_1.SchemaTypes.Number,
    liquidationPrice: mongoose_1.SchemaTypes.Number,
    time: mongoose_1.SchemaTypes.Date
});
const positonsModel = mongoose_1.models.positonsModel || (0, mongoose_1.model)("positonsModel", positonsSchema);
exports.default = positonsModel;
