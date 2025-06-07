"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VendorCategory_1 = __importDefault(require("../models/VendorCategory"));
class VendorCategoryRepository {
    async createVendorCategory(data) {
        const category = new VendorCategory_1.default(data);
        return await category.save();
    }
    async findVendorCategoryById(categoryId) {
        return await VendorCategory_1.default.findById(categoryId);
    }
    async getAll() {
        return await VendorCategory_1.default.find();
    }
    async updateVendorCategory(VendorCategoryId, updateData) {
        return await VendorCategory_1.default.findByIdAndUpdate(VendorCategoryId, updateData, {
            new: true
        });
    }
    async deleteVendorCategory(VendorCategoryId) {
        return await VendorCategory_1.default.findByIdAndDelete(VendorCategoryId, {
            new: true
        });
    }
}
exports.default = new VendorCategoryRepository();
