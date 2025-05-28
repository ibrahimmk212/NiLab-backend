"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const StaffRepository_1 = __importDefault(require("../repositories/StaffRepository"));
class StaffService {
    async createStaff(payload) {
        const staff = await StaffRepository_1.default.findStaffByKey('staffId', payload.staffId);
        if (staff) {
            throw new Error('Staff Already Exist');
        }
        // const hashedPassword = bcrypt.hashSync(payload.password, 5);
        return StaffRepository_1.default.createStaff(Object.assign({}, payload));
    }
    async findById(id) {
        const staff = await StaffRepository_1.default.findStaffById(id);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return staff;
    }
    async findAllByKey(key, val) {
        const staff = await StaffRepository_1.default.findAllByKey(key, val);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return staff;
    }
    getStaffs() {
        throw new Error('Method not implemented.');
    }
    async getStaffDetail(staffId) {
        const staff = await StaffRepository_1.default.findStaffById(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return staff;
    }
    async updateStaff(staffId, payload) {
        const staff = await StaffRepository_1.default.findStaffById(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return StaffRepository_1.default.updateStaff(staffId, payload);
    }
    async deleteStaff(staffId) {
        const staff = await StaffRepository_1.default.findStaffById(staffId);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return StaffRepository_1.default.deleteStaff(staffId);
    }
}
exports.default = new StaffService();
