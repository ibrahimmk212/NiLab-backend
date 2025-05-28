"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdminRepository_1 = __importDefault(require("../repositories/AdminRepository"));
class AdminService {
    async create(payload) {
        return AdminRepository_1.default.createAdmin(payload);
    }
    async find(id) {
        return AdminRepository_1.default.findAdminById(id);
    }
    async getAll() {
        return AdminRepository_1.default.getAll();
    }
}
exports.default = new AdminService();
