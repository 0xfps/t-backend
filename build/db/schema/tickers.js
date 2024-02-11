"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const tickersSchema = new mongoose_1.Schema({
    ticker: mongoose_1.SchemaTypes.String, // tBTC.
    contractAddress: mongoose_1.SchemaTypes.String
});
const tickersModel = mongoose_1.models.tickersModel || (0, mongoose_1.model)("tickersModel", tickersSchema);
exports.default = tickersModel;
