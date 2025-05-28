"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VirtualAccount_1 = __importDefault(require("../models/VirtualAccount"));
class VirtualAccountRepository {
    async createVirtualAccount(data) {
        const virtualAccount = new VirtualAccount_1.default(data);
        return await virtualAccount.save();
    }
    async findVirtualAccountById(virtualAccountId) {
        return await VirtualAccount_1.default.findById(virtualAccountId);
    }
    async updateVirtualAccount(virtualAccountId, updateData) {
        return await VirtualAccount_1.default.findByIdAndUpdate(virtualAccountId, updateData, { new: true });
    }
    async deleteVirtualAccount(virtualAccountId) {
        return await VirtualAccount_1.default.findByIdAndDelete(virtualAccountId, {
            new: true
        });
    }
}
exports.default = new VirtualAccountRepository();
