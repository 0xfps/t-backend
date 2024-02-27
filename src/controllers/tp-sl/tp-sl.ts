import SL from "./sl";
import TP from "./tp";

export default async function TPxSL(price: number) {
    await SL(price)
    await TP(price)
}