"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRADABLE_MARGIN_HANDLER_ADDRESS = exports.TRADABLE_MARGIN_HANDLER_ABI = exports.TRADABLE_SETTINGS_ADDRESS = exports.TRADABLE_SETTINGS_ABI = exports.TRADABLE_MARGIN_VAULT_ADDRESS = exports.TRADABLE_MARGIN_VAULT_ABI = exports.JSON_RPC_URL = exports.BYBIT_SPOT_PRICE_API = exports.BINANCE_API = exports.EIGHT_HOURS = exports.LIQUIDATION_THRESHOLD = exports.SPREAD = exports.POST = exports.GET = exports.MARKET = exports.LIMIT = exports.SHORT = exports.LONG = void 0;
const contracts_json_1 = __importDefault(require("../config/contracts.json"));
// Position types.
exports.LONG = "long";
exports.SHORT = "short";
// Order types.
exports.LIMIT = "limit";
exports.MARKET = "market";
exports.GET = "GET";
exports.POST = "GET";
// Maximum slippage percentage allowed for long and short positions.
// 5%, in this case.
exports.SPREAD = 5;
exports.LIQUIDATION_THRESHOLD = 0.8;
exports.EIGHT_HOURS = 1000 * 60 * 60 * 8;
exports.BINANCE_API = "https://api.binance.com";
exports.BYBIT_SPOT_PRICE_API = "https://api-testnet.bybit.com/v5/market/tickers?category=inverse&symbol="; // Attach symbol.
exports.JSON_RPC_URL = "https://rpc.ankr.com/avalanche_fuji";
exports.TRADABLE_MARGIN_VAULT_ABI = contracts_json_1.default.tradableMarginVault.abi;
exports.TRADABLE_MARGIN_VAULT_ADDRESS = contracts_json_1.default.tradableMarginVault.address;
exports.TRADABLE_SETTINGS_ABI = contracts_json_1.default.tradableSettings.abi;
exports.TRADABLE_SETTINGS_ADDRESS = contracts_json_1.default.tradableSettings.address;
exports.TRADABLE_MARGIN_HANDLER_ABI = contracts_json_1.default.tradableMarginHandler.abi;
exports.TRADABLE_MARGIN_HANDLER_ADDRESS = contracts_json_1.default.tradableMarginHandler.address;
