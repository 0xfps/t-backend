"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const funding_rates_1 = __importDefault(require("../db/schema/funding-rates"));
const constants_1 = require("./constants");
function getFundingRateTimeLeft(ticker) {
    return __awaiter(this, void 0, void 0, function* () {
        const { timeOfLastFunding } = yield funding_rates_1.default.findOne({ ticker: ticker });
        if (!timeOfLastFunding) {
            return constants_1.EIGHT_HOURS;
        }
        const timeLeftTo8Hours = (timeOfLastFunding + constants_1.EIGHT_HOURS) - new Date().getTime();
        return timeLeftTo8Hours;
    });
}
exports.default = getFundingRateTimeLeft;
