import ordersModel from "../db/schema/orders"

export default async function calculateTwap(orderIds: any[], size: number): Promise<number> {
    let TWP = 0

    orderIds.forEach(async function (orderId: any) {
        const { size, price } = await ordersModel.findOne({ orderId: orderId })
        TWP += parseInt(size) * parseInt(price)
    })

    return parseFloat((TWP / size).toFixed(4))
}