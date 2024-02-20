import fundingRatesModel from "../db/schema/funding-rates";
import { EIGHT_HOURS } from "./constants";

export default async function getFundingRateTimeLeft(ticker: string): Promise<number> {
    const { timeOfLastFunding } = await fundingRatesModel.findOne({ ticker: ticker })

    if (!timeOfLastFunding) {
        return EIGHT_HOURS
    }

    const timeLeftTo8Hours = (timeOfLastFunding + EIGHT_HOURS) - new Date().getTime()
    return timeLeftTo8Hours
}