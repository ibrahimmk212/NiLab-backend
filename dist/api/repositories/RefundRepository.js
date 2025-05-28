"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Refund_1 = __importDefault(require("../models/Refund"));
class RefundRepository {
    async createRefund(data) {
        const refund = new Refund_1.default(data);
        return await refund.save();
    }
    async findRefundById(refundId) {
        return await Refund_1.default.findById(refundId);
    }
    async updateRefund(refundId, updateData) {
        return await Refund_1.default.findByIdAndUpdate(refundId, updateData, {
            new: true
        });
    }
    async deleteRefund(refundId) {
        return await Refund_1.default.findByIdAndDelete(refundId, { new: true });
    }
}
exports.default = new RefundRepository();
