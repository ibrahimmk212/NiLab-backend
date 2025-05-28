"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserRepository_1 = __importDefault(require("../repositories/UserRepository"));
class UserService {
    async createUser(payload) {
        const user = await UserRepository_1.default.findUserByKey('phoneNumber', payload.phoneNumber);
        if (user) {
            throw new Error('phone must be unique');
        }
        // const hashedPassword = bcrypt.hashSync(payload.password, 5);
        return UserRepository_1.default.createUser(Object.assign(Object.assign({}, payload), { password: payload.password }));
    }
    async findUserById(id) {
        const user = await UserRepository_1.default.findUserById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async findByEmailOrPhone(email, phone) {
        const user = await UserRepository_1.default.findUserByEmailOrPhone(email, phone);
        return user;
    }
    getUsers() {
        throw new Error('Method not implemented.');
    }
    async getUserDetail(userId) {
        const user = await UserRepository_1.default.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateUser(userId, payload) {
        const user = await UserRepository_1.default.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return UserRepository_1.default.updateUser(userId, payload);
    }
    async addNewAddress(userId, newAddress) {
        return await UserRepository_1.default.addNewAddress(userId, newAddress);
    }
    async updateAddress(userId, addressId, addressData) {
        return await UserRepository_1.default.updateAddress(userId, addressId, addressData);
    }
    async deleteAddress(userId, addressId) {
        return await UserRepository_1.default.deleteAddress(userId, addressId);
    }
    async deleteUser(userId) {
        const user = await UserRepository_1.default.findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return UserRepository_1.default.deleteUser(userId);
    }
}
exports.default = new UserService();
