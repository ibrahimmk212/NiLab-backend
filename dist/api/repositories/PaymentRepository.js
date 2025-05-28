"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Payment_1 = __importDefault(require("../models/Payment"));
class PaymentRepository {
    async createPayment(data) {
        const payment = new Payment_1.default(data);
        return await payment.save();
    }
    async findPaymentById(paymentId) {
        return await Payment_1.default.findById(paymentId);
    }
    async updatePayment(paymentId, updateData) {
        return await Payment_1.default.findByIdAndUpdate(paymentId, updateData, {
            new: true
        });
    }
    async getPaymentByUser(userId) {
        return await Payment_1.default.findOne({ userId });
    }
    async getPaymentByKey(key, value) {
        return await Payment_1.default.findOne({ [key]: value });
    }
}
exports.default = new PaymentRepository();
