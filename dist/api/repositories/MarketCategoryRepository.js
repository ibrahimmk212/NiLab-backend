"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MarketCategory_1 = __importDefault(require("../models/MarketCategory"));
class MarketCategoryRepository {
    async createMarketCategory(data) {
        const category = new MarketCategory_1.default(data);
        return await category.save();
    }
    async findMarketCategoryById(categoryId) {
        return await MarketCategory_1.default.findById(categoryId);
    }
    async getAll() {
        return await MarketCategory_1.default.find();
    }
    async updateMarketCategory(MarketCategoryId, updateData) {
        return await MarketCategory_1.default.findByIdAndUpdate(MarketCategoryId, updateData, {
            new: true
        });
    }
    async deleteMarketCategory(MarketCategoryId) {
        return await MarketCategory_1.default.findByIdAndDelete(MarketCategoryId, {
            new: true
        });
    }
}
exports.default = new MarketCategoryRepository();
