"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CategoryRepository_1 = __importDefault(require("../repositories/CategoryRepository"));
class CategoryService {
    async create(payload) {
        return await CategoryRepository_1.default.createCategory(payload);
    }
    async update(Id, data) {
        return await CategoryRepository_1.default.updateCategory(Id, data);
    }
    async find(id) {
        return await CategoryRepository_1.default.findCategoryById(id);
    }
    async getAll() {
        return await CategoryRepository_1.default.getAll();
    }
}
exports.default = new CategoryService();
