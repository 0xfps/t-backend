"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_RPC_URL = exports.SPREAD = exports.POST = exports.GET = exports.MARKET = exports.LIMIT = exports.SHORT = exports.LONG = void 0;
// Position types.
exports.LONG = "long";
exports.SHORT = "short";
// Order types.
exports.LIMIT = "limit";
exports.MARKET = "market";
exports.GET = "GET";
exports.POST = "GET";
// Maximum slippage percentage allowed for long and short positions.
// 2%, in this case.
exports.SPREAD = 2;
exports.JSON_RPC_URL = "https://goerli.gateway.tenderly.co";
