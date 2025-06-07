"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const Vendor_1 = __importDefault(require("../models/Vendor"));
const Wallet_1 = __importDefault(require("../models/Wallet"));
const Rider_1 = __importDefault(require("../models/Rider"));
class UserRepository {
    // Create a new user
    async createUser(data) {
        const user = new User_1.default(data);
        return await user.save();
    }
    // Create a Customer User
    async createCustomerUser(data) {
        // Create User
        const user = await User_1.default.create(data);
        if (!user)
            throw new Error('Failed to create user');
        const userId = user._id;
        // Create Wallet
        const wallet = await Wallet_1.default.create({ userId });
        if (!wallet)
            throw new Error('Failed to create wallet');
        return { user, wallet };
    }
    // Create Vendor Account
    async createVendorUser(userData) {
        let user, vendor, wallet;
        try {
            // Create User
            user = await User_1.default.create(userData);
            if (!user)
                throw new Error('Failed to create user');
            const userId = user._id;
            // Create Vendor
            vendor = await Vendor_1.default.create(Object.assign(Object.assign({}, userData.vendor), { userId }));
            if (!vendor)
                throw new Error('Failed to create vendor');
            const vendorId = vendor._id;
            // Create Wallet
            wallet = await Wallet_1.default.create({ vendorId });
            if (!wallet)
                throw new Error('Failed to create wallet');
            return { user, vendor, wallet };
        }
        catch (error) {
            // Rollback logic
            if (wallet)
                await Wallet_1.default.deleteOne({ _id: wallet._id });
            if (vendor)
                await Vendor_1.default.deleteOne({ _id: vendor._id });
            if (user)
                await User_1.default.deleteOne({ _id: user._id });
            throw error;
        }
    }
    // Create Vendor Account
    async createRiderUser(userData) {
        let user, vendor, wallet;
        try {
            // Create User
            user = await User_1.default.create(userData);
            if (!user)
                throw new Error('Failed to create user');
            const userId = user._id;
            // Create Vendor
            vendor = await Rider_1.default.create(Object.assign(Object.assign({}, userData.vendor), { userId }));
            if (!vendor)
                throw new Error('Failed to create vendor');
            const vendorId = vendor._id;
            // Create Wallet
            wallet = await Wallet_1.default.create({ vendorId });
            if (!wallet)
                throw new Error('Failed to create wallet');
            return { user, vendor, wallet };
        }
        catch (error) {
            // Rollback logic
            if (wallet)
                await Wallet_1.default.deleteOne({ _id: wallet._id });
            if (vendor)
                await Vendor_1.default.deleteOne({ _id: vendor._id });
            if (user)
                await User_1.default.deleteOne({ _id: user._id });
            throw error;
        }
    }
    // Find a user by ID
    async findUserById(userId, select = '') {
        const user = await User_1.default.findById(userId).select(select);
        return user;
    }
    // Find a user by email
    async findUserByEmail(email) {
        const user = await User_1.default.findOne({ email }).select('+password');
        return user;
    }
    async findUserByEmailOrPhone(email, phone) {
        let prefixNumber = phone;
        if (phone.startsWith('0')) {
            prefixNumber = phone.slice(1); // remove the first character
        }
        const user = await User_1.default.findOne({
            $or: [{ email }, { phoneNumber: phone }, { phoneNumber: prefixNumber }]
        }).select('+password');
        return user;
    }
    // Find a user by email
    async findUserByKey(key, value) {
        return await User_1.default.findOne({ [key]: value });
    }
    // Update a user by ID
    async updateUser(userId, updateData) {
        return await User_1.default.findByIdAndUpdate(userId, updateData, {
            new: true
        });
    }
    async addNewAddress(userId, newAddress) {
        return await User_1.default.findByIdAndUpdate(userId, { $push: { addresses: newAddress } }, { new: true, safe: true, upsert: true });
    }
    async updateAddress(userId, addressId, addressData) {
        return await User_1.default.findOneAndUpdate({ _id: userId, 'addresses._id': addressId }, {
            $set: {
                'addresses.$': addressData
            }
        }, { new: true });
    }
    async deleteAddress(userId, addressId) {
        return await User_1.default.findByIdAndUpdate(userId, { $pull: { addresses: { _id: addressId } } }, { new: true });
    }
    // Delete a user
    async deleteUser(userId) {
        return await User_1.default.findByIdAndDelete(userId, {
            new: true
        });
    }
}
exports.default = new UserRepository();
