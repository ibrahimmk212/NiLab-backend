"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Order_1 = __importDefault(require("../models/Order"));
class OrderRepository {
    constructor() {
        this.populatedData = {
            path: 'vendor user rider dispatch order products.product',
            select: '-role -addresses -location -categories -userId -bankAccount'
            // populate: { path: 'products', populate: { path: 'product' } }
        };
        // Additional order-specific methods...
    }
    async createOrder(data) {
        const order = new Order_1.default(data);
        return await order.save();
    }
    async findOrderById(orderId) {
        return await Order_1.default.findById(orderId).populate(this.populatedData);
    }
    async findOrderByReference(paymentReference) {
        return await Order_1.default.findOne({ paymentReference });
    }
    async findOrderByVendor(vendorId, data) {
        // const page = data?.page ?? 1;
        // const limit = data?.limit ?? 10;
        var _a, _b;
        const total = await Order_1.default.countDocuments();
        const page = parseInt(((_a = data.page) === null || _a === void 0 ? void 0 : _a.toString()) || '1', 10);
        const limit = parseInt(((_b = data.limit) === null || _b === void 0 ? void 0 : _b.toString()) || `${total}`, 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        return await Order_1.default.find({ vendor: vendorId })
            .skip(startIndex)
            .limit(limit)
            .populate(this.populatedData).sort({ createdAt: -1 });
    }
    async findAll() {
        // const total = await OrderModel.countDocuments();
        // const page = parseInt(data.page?.toString() || '1', 10);
        // const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        // .skip(startIndex)
        // .limit(limit)
        return await Order_1.default.find().populate(this.populatedData).sort({ createdAt: -1 });
    }
    async findOrderByCustomer(customerId) {
        return await Order_1.default.find({ user: customerId }).populate(this.populatedData).sort({ createdAt: -1 });
    }
    async updateOrder(orderId, updateData) {
        return await Order_1.default.findByIdAndUpdate(orderId, updateData, {
            new: true
        }).populate({
            path: 'vendor user rider dispatch',
            select: '-role -addresses -location -categories -userId'
        });
    }
    async deleteOrder(order) {
        return await Order_1.default.findByIdAndDelete(order, { new: true });
    }
}
exports.default = new OrderRepository();
