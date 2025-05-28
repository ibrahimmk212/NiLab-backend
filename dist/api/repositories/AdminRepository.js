"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Admin_1 = __importDefault(require("../models/Admin"));
class AdminRepository {
    async createAdmin(data) {
        const admin = new Admin_1.default(data);
        return await admin.save();
    }
    async findAdminById(adminId) {
        return await Admin_1.default.findById(adminId);
    }
    async updateAdmin(adminId, updateData) {
        return await Admin_1.default.findByIdAndUpdate(adminId, updateData, {
            new: true
        });
    }
    async getAll() {
        return await Admin_1.default.find();
    }
    async deleteAdmin(adminId) {
        return await Admin_1.default.findByIdAndDelete(adminId, {
            new: true
        });
    }
}
exports.default = new AdminRepository();
