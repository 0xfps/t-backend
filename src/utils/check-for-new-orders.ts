import ordersModel from "../db/schema/orders";
import fundingRate from "./funding-rate";

export default async function checkForNewOrders(ticker: string) {
    const allOrders = await ordersModel.find({}).sort({ time: "descending" })
    if (allOrders.length == 0) return

    const lastOrder = allOrders[allOrders.length]

    if ((new Date().getTime() - lastOrder.time) > 300_000) {
        await fundingRate(ticker)
    }
}