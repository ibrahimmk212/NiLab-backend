"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../utils/helpers");
const Delivery_1 = __importDefault(require("../models/Delivery"));
const DeliveryRepository_1 = __importDefault(require("../repositories/DeliveryRepository"));
const OrderService_1 = __importDefault(require("./OrderService"));
class DeliveryService {
    async createDelivery(orderId) {
        const deliveryExists = (await Delivery_1.default.find({
            orderId: orderId
        }).countDocuments()) === 0;
        if (deliveryExists)
            return;
        const order = await OrderService_1.default.getOrderById(orderId);
        if (!order) {
            return;
        }
        const vendor = order.vendor;
        const customer = order.user;
        const deliveryData = {
            deliveryCode: (0, helpers_1.generateRandomNumbers)(6),
            pickup: {
                name: vendor === null || vendor === void 0 ? void 0 : vendor.name,
                address: vendor === null || vendor === void 0 ? void 0 : vendor.address,
                lat: order.pickupLocation[1],
                long: order.pickupLocation[0]
            },
            destination: {
                name: customer.name,
                address: customer.address,
                lat: order.deliveryLocation[1],
                long: order.deliveryLocation[0]
            },
            senderDetails: {
                name: vendor.name,
                contactNumber: vendor.phone
            },
            receiverDetails: {
                name: customer.name,
                contactNumber: customer.phone
            },
            specialInstructions: '' // Any special delivery instructions
            // estimatedDeliveryTime: ''; // Estimated delivery time
        };
        const delivery = await DeliveryRepository_1.default.createDelivery(deliveryData);
        // TODO send notification
        return delivery;
    }
    async updateDeliveryStatus(deliveryId, status) {
        return await DeliveryRepository_1.default.updateDelivery(deliveryId, { status });
    }
    async getAvailableDeliveries() {
        return await DeliveryRepository_1.default.getAvailableDeliveries();
    }
    async getDeliveryById(deliveryId) {
        return await DeliveryRepository_1.default.getDeliveryById(deliveryId);
    }
    async getDeliveriesForRider(riderId) {
        return await DeliveryRepository_1.default.getDeliveriesForRider(riderId);
    }
    async getActiveDeliveries(riderId) {
        return await DeliveryRepository_1.default.getActiveDeliveries(riderId);
    }
}
exports.default = new DeliveryService();
