import mongoose from 'mongoose';
import UserModel, { Address, User } from '../models/User';
import VendorModel, { Vendor } from '../models/Vendor';
import WalletModel, { Wallet } from '../models/Wallet';
import { VendorSignUpType } from '../types/auth';
import RiderModel from '../models/Rider';

class UserRepository {
    // Create a new user
    async createUser(data: Partial<User>): Promise<User> {
        const user = new UserModel(data);
        return await user.save();
    }

    // Create a Customer User
    async createCustomerUser(data: Partial<User>): Promise<any> {
        let user, wallet;
        try {
            // Create User
            user = await UserModel.create(data);
            if (!user) throw new Error('Failed to create user');

            const userId = user._id;

            // Create Wallet
            wallet = await WalletModel.create({ userId });
            if (!wallet) throw new Error('Failed to create wallet');

            return { user, wallet };
        } catch (error) {
            // Rollback logic
            // if (wallet) await WalletModel.deleteOne({ _id: wallet._id });
            // if (user) await UserModel.deleteOne({ _id: user._id });
            throw error;
        }
    }

    // Create Vendor Account
    async createVendorUser(userData: VendorSignUpType) {
        let user, vendor, wallet;
        try {
            // Create User
            user = await UserModel.create(userData);
            if (!user) throw new Error('Failed to create user');

            const userId = user._id;

            // Create Vendor
            vendor = await VendorModel.create({ ...userData.vendor, userId });
            if (!vendor) throw new Error('Failed to create vendor');

            const vendorId = vendor._id;

            // Create Wallet
            wallet = await WalletModel.create({ vendorId });
            if (!wallet) throw new Error('Failed to create wallet');

            return { user, vendor, wallet };
        } catch (error) {
            // Rollback logic
            if (wallet) await WalletModel.deleteOne({ _id: wallet._id });
            if (vendor) await VendorModel.deleteOne({ _id: vendor._id });
            if (user) await UserModel.deleteOne({ _id: user._id });
            throw error;
        }
    }

    // Create Vendor Account
    async createRiderUser(userData: VendorSignUpType) {
        let user, vendor, wallet;
        try {
            // Create User
            user = await UserModel.create(userData);
            if (!user) throw new Error('Failed to create user');

            const userId = user._id;

            // Create Vendor
            vendor = await RiderModel.create({ ...userData.vendor, userId });
            if (!vendor) throw new Error('Failed to create vendor');

            const vendorId = vendor._id;

            // Create Wallet
            wallet = await WalletModel.create({ vendorId });
            if (!wallet) throw new Error('Failed to create wallet');

            return { user, vendor, wallet };
        } catch (error) {
            // Rollback logic
            if (wallet) await WalletModel.deleteOne({ _id: wallet._id });
            if (vendor) await VendorModel.deleteOne({ _id: vendor._id });
            if (user) await UserModel.deleteOne({ _id: user._id });
            throw error;
        }
    }


    // Find a user by ID
    async findUserById(userId: string, select = ''): Promise<User | null> {
        const user = await UserModel.findById(userId).select(select);
        return user;
    }

    // Find a user by email
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email }).select('+password');
        return user;
    }

    // Find a user by email
    async findUserByEmailOrPhone(
        email: string,
        phone: any
    ): Promise<User | null> {

        let prefixNumber = phone;
        if (phone.startsWith('0')) {
            prefixNumber = phone.slice(1); // remove the first character
        } 
        const user = await UserModel.findOne({
            $or: [{ email }, { phoneNumber: phone }, { phoneNumber: prefixNumber }]
        }).select('+password');
        return user;
    }
    // Find a user by email
    async findUserByKey(key: string, value: string): Promise<User | null> {
        return await UserModel.findOne({ [key]: value });
    }

    // Update a user by ID
    async updateUser(
        userId: string,
        updateData: Partial<User>
    ): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(userId, updateData, {
            new: true
        });
    }

    async addNewAddress(
        userId: string,
        newAddress: Address
    ): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $push: { addresses: newAddress } },
            { new: true, safe: true, upsert: true }
        );
    }

    async updateAddress(
        userId: string,
        addressId: string,
        addressData: Address
    ): Promise<User | null> {
        return await UserModel.findOneAndUpdate(
            { _id: userId, 'addresses._id': addressId },
            {
                $set: {
                    'addresses.$': addressData
                }
            },
            { new: true }
        );
    }

    async deleteAddress(
        userId: string,
        addressId: string
    ): Promise<User | null> {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );
    }

    // Delete a user
    async deleteUser(userId: string): Promise<User | null> {
        return await UserModel.findByIdAndDelete(userId, {
            new: true
        });
    }

    // Additional user-specific methods...
}

export default new UserRepository();
