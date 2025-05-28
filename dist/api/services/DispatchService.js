"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DispatchRepository_1 = __importDefault(require("../repositories/DispatchRepository"));
class DispatchService {
    async createDispatch(dispatchData) {
        return await DispatchRepository_1.default.createDispatch(dispatchData);
    }
    async updateDispatch(dispatchId, updateData) {
        return await DispatchRepository_1.default.updateDispatch(dispatchId, updateData);
    }
    async addDeliveriesToDispatch(dispatchId, deliveryIds) {
        return await DispatchRepository_1.default.addDeliveriesToDispatch(dispatchId, deliveryIds);
    }
    async getDispatchById(dispatchId) {
        return await DispatchRepository_1.default.getDispatchById(dispatchId);
    }
    async getDispatchesForRider(riderId) {
        return await DispatchRepository_1.default.getDispatchesForRider(riderId);
    }
    async getActiveDispatch(riderId) {
        return await DispatchRepository_1.default.getActiveDispatch(riderId);
    }
}
exports.default = new DispatchService();
