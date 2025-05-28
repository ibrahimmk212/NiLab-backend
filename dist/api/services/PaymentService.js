"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PaymentRepository_1 = __importDefault(require("../repositories/PaymentRepository"));
class PaymentService {
    async createPayment(createPayment) {
        const data = await PaymentRepository_1.default.createPayment(createPayment);
    }
    async findPaymentById(paymentId) {
        return await PaymentRepository_1.default.findPaymentById(paymentId);
    }
    async updatePaymentStatus(paymentId, updatePaymentStatus) {
        const payment = await PaymentRepository_1.default.findPaymentById(paymentId);
        if (!payment)
            throw new Error('Payment not found');
        payment.status = updatePaymentStatus.status;
        await PaymentRepository_1.default.updatePayment(paymentId, payment);
        return payment;
    }
    async updatePaymentMeta(paymentId, updatePaymentMeta) {
        const payment = await PaymentRepository_1.default.findPaymentById(paymentId);
        if (!payment)
            throw new Error('Payment not found');
        payment.metaData = updatePaymentMeta.metaData;
        await PaymentRepository_1.default.updatePayment(paymentId, payment);
        return payment;
    }
    async getPaymentByUser(userId) {
        return await PaymentRepository_1.default.getPaymentByUser(userId);
    }
    async getPaymentByVendor(vendorId) {
        const data = await PaymentRepository_1.default.getPaymentByKey("vendorId", vendorId);
        if (!data)
            throw new Error('Payment not found');
        return data;
    }
    async getPaymentByRider(riderId) {
        const data = await PaymentRepository_1.default.getPaymentByKey("riderId", riderId);
        if (!data)
            throw new Error('Payment not found');
        return data;
    }
    async getPaymentByOrderId(orderId) {
        const data = await PaymentRepository_1.default.getPaymentByKey("orderId", orderId);
        if (!data)
            throw new Error('Payment not found');
        return data;
    }
    async getPaymentByWalletId(walletId) {
        const data = await PaymentRepository_1.default.getPaymentByKey("walletId", walletId);
        if (!data)
            throw new Error('Payment not found');
        return data;
    }
    async getPaymentByKey(key, value) {
        return await PaymentRepository_1.default.getPaymentByKey(key, value);
    }
}
exports.default = new PaymentService();
