"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProductRepository_1 = __importDefault(require("../repositories/ProductRepository"));
class ProductService {
    async create(payload) {
        return ProductRepository_1.default.createProduct(payload);
    }
    async findById(id) {
        return ProductRepository_1.default.findProductById(id);
    }
    async search(query) {
        return ProductRepository_1.default.searchProduct(query);
    }
    async getAll() {
        return ProductRepository_1.default.getAll();
    }
    async getAllByVendor(vendorId) {
        return ProductRepository_1.default.getAllByVendor(vendorId);
    }
    async getAllByCategory(categoryId) {
        return ProductRepository_1.default.getAllByCategory(categoryId);
    }
    async update(productId, updateData) {
        return ProductRepository_1.default.updateProduct(productId, updateData);
    }
}
exports.default = new ProductService();
