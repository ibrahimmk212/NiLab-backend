"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const VendorRepository_1 = __importDefault(require("../repositories/VendorRepository"));
class VendorService {
    async create(payload) {
        return VendorRepository_1.default.createVendor(payload);
    }
    async getById(id) {
        const vendor = await VendorRepository_1.default.findById(id);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    }
    async getAll() {
        return await VendorRepository_1.default.findAllVendors();
    }
    // nearby vendors
    async getNearbyVendors(longitude, latitude, maxDistance) {
        return await VendorRepository_1.default.findNearbyVendors(longitude, latitude, maxDistance);
    }
    // find vendors options
    async getVendorsByOption(options) {
        return await VendorRepository_1.default.findVendorsByOption(options);
    }
    async getVendorsByCategory(categoryId) {
        return await VendorRepository_1.default.findVendorsByCategory(categoryId);
    }
    async get(vendorId) {
        const vendor = await VendorRepository_1.default.findById(vendorId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    }
    async update(vendorId, payload) {
        const vendor = await VendorRepository_1.default.findById(vendorId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return VendorRepository_1.default.update(vendorId, payload);
    }
    async addCategory(vendorId, categoryId) {
        return await VendorRepository_1.default.addNewCategory(vendorId, categoryId);
    }
    async updateBank(vendorId, payload) {
        const vendor = await VendorRepository_1.default.findById(vendorId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return VendorRepository_1.default.updateBank(vendorId, payload);
    }
    async updateLocation(vendorId, payload) {
        const vendor = await VendorRepository_1.default.findById(vendorId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return VendorRepository_1.default.updateLocation(vendorId, payload);
    }
}
exports.default = new VendorService();
