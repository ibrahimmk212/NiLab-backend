"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_1 = __importDefault(require("../models/Transaction"));
class TransactionRepository {
    async createTransaction(data) {
        const transaction = new Transaction_1.default(data);
        return await transaction.save();
    }
    async findTransactionById(transactionId) {
        return await Transaction_1.default.findById(transactionId);
    }
    async updateTransaction(transactionId, updateData) {
        return await Transaction_1.default.findByIdAndUpdate(transactionId, updateData, { new: true });
    }
    async deleteTransaction(transactionId) {
        return await Transaction_1.default.findByIdAndDelete(transactionId, {
            new: true
        });
    }
}
exports.default = new TransactionRepository();
