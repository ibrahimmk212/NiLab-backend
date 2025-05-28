"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Staff_1 = __importDefault(require("../models/Staff"));
class StaffRepository {
    async createStaff(data) {
        const staff = new Staff_1.default(data);
        return await staff.save();
    }
    async findStaffById(staffId) {
        return await Staff_1.default.findById(staffId);
    }
    // Find a user by email
    async findStaffByKey(key, value) {
        return await Staff_1.default.findOne({ [key]: value }).populate({
            path: 'vendor user',
            select: ' -userId'
        });
    }
    async findAll(key, value) {
        return await Staff_1.default.find().populate({
            path: 'vendor user',
            select: ' -userId'
        });
    }
    async findAllByKey(key, value) {
        return await Staff_1.default.find({ [key]: value }).populate({
            path: 'vendor user',
            select: ' -userId'
        });
    }
    async updateStaff(staffId, updateData) {
        return await Staff_1.default.findByIdAndUpdate(staffId, updateData, {
            new: true
        });
    }
    async deleteStaff(staffId) {
        return await Staff_1.default.findByIdAndDelete(staffId, {
            new: true
        });
    }
}
exports.default = new StaffRepository();
