"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VendorCategoryRepository_1 = __importDefault(require("../repositories/VendorCategoryRepository"));
class VendorCategoryService {
    async create(payload) {
        return await VendorCategoryRepository_1.default.createVendorCategory(payload);
    }
    async update(Id, data) {
        return await VendorCategoryRepository_1.default.updateVendorCategory(Id, data);
    }
    async find(id) {
        return await VendorCategoryRepository_1.default.findVendorCategoryById(id);
    }
    async getAll() {
        return await VendorCategoryRepository_1.default.getAll();
    }
}
exports.default = new VendorCategoryService();
