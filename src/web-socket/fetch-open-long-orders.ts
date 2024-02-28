import ordersModel from "../db/schema/orders";
import { LONG } from "../utils/constants";

export default async function fetchOpenLongOrders(ticker: string) {
    const allOpenLongOrders = await ordersModel.find(
        {
            positionType: LONG,
            ticker: ticker,
            deleted: false,
            filled: false
        }
    )

    if (allOpenLongOrders.length == 0) {
        return []
    }

    return allOpenLongOrders
}