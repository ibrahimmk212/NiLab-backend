"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Dispatch_1 = __importDefault(require("../models/Dispatch"));
class DispatchRepository {
    async createDispatch(dispatchData) {
        const dispatch = new Dispatch_1.default(dispatchData);
        return await dispatch.save();
    }
    async updateDispatch(dispatchId, updateData) {
        return await Dispatch_1.default.findByIdAndUpdate(dispatchId, updateData, {
            new: true
        });
    }
    async addDeliveriesToDispatch(dispatchId, deliveryIds) {
        return await Dispatch_1.default.findByIdAndUpdate(dispatchId, { $addToSet: { deliveries: { $each: deliveryIds } } }, { new: true });
    }
    async getDispatchById(dispatchId) {
        return await Dispatch_1.default.findById(dispatchId).populate('deliveries');
    }
    async getDispatchesForRider(riderId) {
        return await Dispatch_1.default.find({ riderId }).populate('deliveries');
    }
    async getActiveDispatch(riderId) {
        const dispatch = await Dispatch_1.default.findOne({
            riderId,
            status: { $ne: 'completed' }
        }).populate('deliveries');
        return dispatch;
    }
}
exports.default = new DispatchRepository();
