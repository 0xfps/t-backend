import fundingRatesModel from "../db/schema/funding-rates";
import { EIGHT_HOURS } from "./constants";

/**
 * Funding rates are charged every 8 hours. This function returns the 8 hour difference
 * between the last funding rate time and the next funding rate.
 * 
 * @param ticker Ticker.
 * @returns Time left until 8 hours.
 */
export default async function getFundingRateTimeLeft(ticker: string): Promise<number> {
    const fundingRates = await fundingRatesModel.findOne({ ticker: ticker })

    if (!fundingRates) {
        return EIGHT_HOURS
    }

    const timeLeftTo8Hours = (parseInt(fundingRates.timeOfLastFunding) + EIGHT_HOURS) - new Date().getTime()
    return timeLeftTo8Hours
}