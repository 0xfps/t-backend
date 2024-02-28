import ordersModel from "../db/schema/orders";
import { SHORT } from "../utils/constants";

export default async function fetchOpenShortOrders(ticker: string) {
    const allOpenShortOrders = await ordersModel.find(
        {
            positionType: SHORT,
            ticker: ticker,
            deleted: false,
            filled: false
        }
    )

    if (allOpenShortOrders.length == 0) {
        return []
    }

    return allOpenShortOrders
}