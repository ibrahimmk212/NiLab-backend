"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const OrderRepository_1 = __importDefault(require("../repositories/OrderRepository"));
class OrderService {
    async createOrder(orderData) {
        return await OrderRepository_1.default.createOrder(orderData);
    }
    async getOrderById(orderId) {
        return await OrderRepository_1.default.findOrderById(orderId);
    }
    async getOrderByReference(paymentReference) {
        return await OrderRepository_1.default.findOrderByReference(paymentReference);
    }
    async getAll() {
        return await OrderRepository_1.default.findAll();
    }
    async getOrdersByVendor(vendorId, data) {
        return await OrderRepository_1.default.findOrderByVendor(vendorId, data);
    }
    async getOrdersByCustomer(customerId) {
        return await OrderRepository_1.default.findOrderByCustomer(customerId);
    }
    async updateOrder(orderId, updateData) {
        return await OrderRepository_1.default.updateOrder(orderId, updateData);
    }
    async deleteOrder(orderId) {
        return await OrderRepository_1.default.deleteOrder(orderId);
    }
}
exports.default = new OrderService();
