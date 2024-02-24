"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ordersSchema = new mongoose_1.Schema({
    orderId: mongoose_1.SchemaTypes.String,
    aoriOrderId: mongoose_1.SchemaTypes.String,
    // Order object starts here.
    positionType: mongoose_1.SchemaTypes.String, // "long" | "short"
    type: mongoose_1.SchemaTypes.String, // "limit" | "market"
    opener: mongoose_1.SchemaTypes.String,
    market: mongoose_1.SchemaTypes.String, // BTC/USD
    margin: mongoose_1.SchemaTypes.Number,
    leverage: mongoose_1.SchemaTypes.Number,
    assetA: mongoose_1.SchemaTypes.String,
    assetB: mongoose_1.SchemaTypes.String,
    ticker: mongoose_1.SchemaTypes.String, // tBTC.
    size: mongoose_1.SchemaTypes.Number,
    sizeLeft: mongoose_1.SchemaTypes.Number,
    price: mongoose_1.SchemaTypes.Number,
    // Ends here.
    // Orders that filled this order.
    filled: mongoose_1.SchemaTypes.Boolean,
    fillingOrders: mongoose_1.SchemaTypes.Array,
    deleted: mongoose_1.SchemaTypes.Boolean,
    time: mongoose_1.SchemaTypes.Date
});
const ordersModel = mongoose_1.models.ordersModel || (0, mongoose_1.model)("ordersModel", ordersSchema);
exports.default = ordersModel;
