"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const pendingOrdersSchema = new mongoose_1.Schema({
    order: {
        type: Object,
        default: {}
    },
    time: mongoose_1.SchemaTypes.Date
});
const pendingOrdersModel = mongoose_1.models.pendingOrdersModel || (0, mongoose_1.model)("pendingOrdersModel", pendingOrdersSchema);
exports.default = pendingOrdersModel;
