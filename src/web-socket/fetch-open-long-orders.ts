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
    ).sort({ price: "descending" })

    if (allOpenLongOrders.length == 0) {
        return []
    }

    return allOpenLongOrders
}