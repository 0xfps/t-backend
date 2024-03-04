import fundingRatesModel from "../db/schema/funding-rates";
import { EIGHT_HOURS } from "./constants";

export default async function getFundingRateTimeLeft(ticker: string): Promise<number> {
    const fundingRates = await fundingRatesModel.findOne({ ticker: ticker })

    if (!fundingRates) {
        return EIGHT_HOURS
    }

    const timeLeftTo8Hours = (parseInt(fundingRates.timeOfLastFunding) + EIGHT_HOURS) - new Date().getTime()
    return timeLeftTo8Hours
}