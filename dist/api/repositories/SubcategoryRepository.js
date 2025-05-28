"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Subcategory_1 = __importDefault(require("../models/Subcategory"));
class SubcategoryRepository {
    async createSubcategory(data) {
        const subcategory = new Subcategory_1.default(data);
        return await subcategory.save();
    }
    async findSubcategoryById(subCategoryId) {
        return await Subcategory_1.default.findById(subCategoryId);
    }
    async getAll() {
        return await Subcategory_1.default.find();
    }
    async updateSubcategory(categoryId, updateData) {
        return await Subcategory_1.default.findByIdAndUpdate(categoryId, updateData, {
            new: true
        });
    }
    async deleteSubcategory(categoryId) {
        return await Subcategory_1.default.findByIdAndDelete(categoryId, {
            new: true
        });
    }
}
exports.default = new SubcategoryRepository();
