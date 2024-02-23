"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const completely_fill_order_1 = __importDefault(require("../fill-order/completely-fill-order"));
const partially_fill_order_1 = __importDefault(require("../fill-order/partially-fill-order"));
/**
 * This function completes two market orders.
 * completingOrder fills the `order`.
 *
 * @param order
 * @param completingOrders
 */
function completeOrder(order, completingOrders) {
    return __awaiter(this, void 0, void 0, function* () {
        let status = true;
        let reason = "";
        if (!order.filled) {
            // Get size of order to be filled.
            const totalOrderSize = parseFloat(order.size);
            let totalOrderSizeLeft = parseFloat(order.sizeLeft);
            // Iterate and fill the order up if the size of the order to fill the
            // initial order, when added to the current size is still below the
            // total size.
            // Orders coming here will pass the following criteria.
            // 1. Market.size <= Limit.size. (Markets can fill limit.)
            // 2. Limit.size !< Market.size. (Limits cannot fill market.)
            // 3. Market.size == Market.size.
            // 4. Limit.size >= Limit.size. (Limits can fill limits.)
            // 5. Limit.size <= Limit.size. (Limits can fill limits.)
            completingOrders.forEach(function (completingOrder) {
                return __awaiter(this, void 0, void 0, function* () {
                    // Fill the order if the size left is > 0.
                    if (totalOrderSizeLeft > 0) {
                        const completingOrderSize = parseFloat(completingOrder.size);
                        // If the size of the main order is still > the size of
                        // the filling order, then go ahead and fill the main order.
                        if (totalOrderSize > completingOrderSize) {
                            // Fill the completing order.
                            const [success1, reason1] = yield (0, completely_fill_order_1.default)(completingOrder, order);
                            // Partially open the order.
                            const [success2, reason2] = yield (0, partially_fill_order_1.default)(order, completingOrder);
                            status = status && success1 && success2;
                            reason += `${reason1}, ${reason2}. `;
                            // Total order size left goes down.
                            totalOrderSizeLeft -= completingOrderSize;
                        }
                        // If the size of the main order is still > the size of
                        // the filling order, then go ahead and fill the main order.
                        if (totalOrderSize < completingOrderSize) {
                            // Fill the completing order.
                            const [success1, reason1] = yield (0, completely_fill_order_1.default)(order, completingOrder);
                            // Partially open the order.
                            const [success2, reason2] = yield (0, partially_fill_order_1.default)(completingOrder, order);
                            status = status && success1 && success2;
                            reason += `${reason1}, ${reason2}. `;
                            // Total order size left goes down.
                            totalOrderSizeLeft = 0;
                        }
                        // Only one slot left.
                        if (totalOrderSize == completingOrderSize) {
                            // Fill the main order.
                            const [success1, reason1] = yield (0, completely_fill_order_1.default)(order, completingOrder);
                            // Partially open the completing order.
                            const [success2, reason2] = yield (0, completely_fill_order_1.default)(completingOrder, order);
                            status = status && success1 && success2;
                            reason += `${reason1}, ${reason2}. `;
                            totalOrderSizeLeft = 0;
                        }
                    }
                });
            });
        }
        return [status, reason];
    });
}
exports.default = completeOrder;
