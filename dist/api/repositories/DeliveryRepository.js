"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Delivery_1 = __importDefault(require("../models/Delivery"));
class DeliveryRepository {
    async createDelivery(deliveryData) {
        const delivery = new Delivery_1.default(deliveryData);
        return await delivery.save();
    }
    async updateDelivery(deliveryId, updateData) {
        return await Delivery_1.default.findByIdAndUpdate(deliveryId, updateData, {
            new: true
        });
    }
    async getAvailableDeliveries() {
        return await Delivery_1.default.find({ riderId: null });
    }
    async getDeliveryById(deliveryId) {
        return await Delivery_1.default.findById(deliveryId);
    }
    async getDeliveriesForRider(riderId) {
        return await Delivery_1.default.find({ riderId });
    }
    async getActiveDeliveries(riderId) {
        return await Delivery_1.default.find({
            riderId,
            status: { $ne: 'delivered' }
        });
    }
}
exports.default = new DeliveryRepository();
