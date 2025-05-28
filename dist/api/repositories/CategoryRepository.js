"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = __importDefault(require("../models/Category"));
class CategoryRepository {
    async createCategory(data) {
        const category = new Category_1.default(data);
        return await category.save();
    }
    async findCategoryById(categoryId) {
        return await Category_1.default.findById(categoryId);
    }
    async getAll() {
        return await Category_1.default.find();
    }
    async updateCategory(categoryId, updateData) {
        return await Category_1.default.findByIdAndUpdate(categoryId, updateData, {
            new: true
        });
    }
    async deleteCategory(categoryId) {
        return await Category_1.default.findByIdAndDelete(categoryId, {
            new: true
        });
    }
}
exports.default = new CategoryRepository();
