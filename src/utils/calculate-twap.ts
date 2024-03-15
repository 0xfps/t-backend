import ordersModel from "../db/schema/orders"

/**
 * Calculates the Time Weighted Average Price for an array of orders and a particular
 * size. The size comes from the parent order being filled and the orderIds are the 
 * filling orders. Remember that?
 * 
 * TWAP =       E(FillingOrder(n).size * FillingOrder(n).price)
 *          ------------------------------------------------------
 *                             FilledOrder.size
 * 
 * @param orderIds  An array of orders.
 * @param size      Size of the filled order.
 * @returns Promise<number>
 */
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