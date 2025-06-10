"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MarketCategoryRepository_1 = __importDefault(require("../repositories/MarketCategoryRepository"));
class MarketCategoryService {
    async create(payload) {
        return await MarketCategoryRepository_1.default.createMarketCategory(payload);
    }
    async update(Id, data) {
        return await MarketCategoryRepository_1.default.updateMarketCategory(Id, data);
    }
    async find(id) {
        return await MarketCategoryRepository_1.default.findMarketCategoryById(id);
    }
    async getAll() {
        return await MarketCategoryRepository_1.default.getAll();
    }
}
exports.default = new MarketCategoryService();
