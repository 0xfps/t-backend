"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userAddressesSchema = new mongoose_1.Schema({
    user: mongoose_1.SchemaTypes.String,
    tWallet: mongoose_1.SchemaTypes.String,
    privateKey: mongoose_1.SchemaTypes.String,
    time_created: mongoose_1.SchemaTypes.Date
});
const userAddressesModel = mongoose_1.models.userAddressesModel || (0, mongoose_1.model)("userAddressesModel", userAddressesSchema);
exports.default = userAddressesModel;
