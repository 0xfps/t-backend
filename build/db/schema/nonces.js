"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const noncesSchema = new mongoose_1.Schema({
    id: mongoose_1.SchemaTypes.String,
    nonce: mongoose_1.SchemaTypes.Number
});
const noncesModel = mongoose_1.models.noncesModel || (0, mongoose_1.model)("noncesModel", noncesSchema);
exports.default = noncesModel;
