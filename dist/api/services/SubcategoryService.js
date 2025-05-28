"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SubcategoryRepository_1 = __importDefault(require("../repositories/SubcategoryRepository"));
const VendorRepository_1 = __importDefault(require("../repositories/VendorRepository"));
class SubcategoryService {
    async create(payload) {
        const vendor = await VendorRepository_1.default.findByKey("userId", payload.userId);
        console.log(vendor);
        if (!vendor) {
            throw Error("Vendor not found!");
        }
        return SubcategoryRepository_1.default.createSubcategory(Object.assign(Object.assign({}, payload), { vendorId: vendor.id }));
    }
    async find(id) {
        return SubcategoryRepository_1.default.findSubcategoryById(id);
    }
    async getAll() {
        return SubcategoryRepository_1.default.getAll();
    }
}
exports.default = new SubcategoryService();
