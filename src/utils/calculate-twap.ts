import ordersModel from "../db/schema/orders"

export default async function calculateTwap(orderIds: any[], size: number): Promise<number> {
    let TWP = 0

    const twps = orderIds.map(async function (orderId: any) {
        const { size, price } = await ordersModel.findOne({ orderId: orderId })
        return parseFloat(size) * parseFloat(price)
    })

    const TWPs = await Promise.all(twps)

    TWPs.forEach(function (thisTWP: any) {
        TWP += parseFloat(thisTWP)
    })

    return parseFloat((TWP / size).toFixed(4))
}