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
        return await Product_1.default.findById(productId);
    }
    async getAll() {
        return await Product_1.default.find();
    }
    async searchProduct(query) {
        // keys
        const keys = Object.keys(query);
        // values
        const values = Object.values(query);
        const search = keys.map((key, index) => {
            return { [key]: values[index] };
        });
        return await Product_1.default.find({ $or: search });
    }
    async getAllByVendor(vendorId) {
        // const total = await OrderModel.countDocuments();
        // const page = parseInt(data.page?.toString() || '1', 10);
        // const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;
        return await Product_1.default.find({ vendor: vendorId });
        // .skip(startIndex)
        // .limit(limit)
    }
    async getAllByCategory(categoryId) {
        return await Product_1.default.find({ category: categoryId });
    }
    async updateProduct(productId, updateData) {
        return await Product_1.default.findByIdAndUpdate(productId, updateData, {
            new: true
        });
    }
    async deleteProduct(productId) {
        return await Product_1.default.findByIdAndDelete(productId, { new: true });
    }
}
exports.default = new ProductRepository();
