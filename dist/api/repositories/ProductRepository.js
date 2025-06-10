"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Product_1 = __importDefault(require("../models/Product"));
class ProductRepository {
    async createProduct(data) {
        const product = new Product_1.default(data);
        return await product.save();
    }
    async findProductById(productId) {
        return await Product_1.default.findById(productId).populate('vendor');
    }
    async getAll() {
        return await Product_1.default.find().populate('vendor');
    }
    async searchProduct(query) {
        const keys = Object.keys(query);
        const values = Object.values(query);
        const search = keys.map((key, index) => {
            return { [key]: values[index] };
        });
        return await Product_1.default.find({ $or: search }).populate('vendor');
    }
    async getAllByVendor(vendorId) {
        return await Product_1.default.find({ vendor: vendorId }).populate('vendor');
    }
    async getAllByCategory(categoryId) {
        return await Product_1.default.find({ category: categoryId }).populate('vendor');
    }
    async updateProduct(productId, updateData) {
        return await Product_1.default.findByIdAndUpdate(productId, updateData, {
            new: true
        }).populate('vendor');
    }
    async deleteProduct(productId) {
        return await Product_1.default.findByIdAndDelete(productId, { new: true }).populate('vendor');
    }
}
exports.default = new ProductRepository();
