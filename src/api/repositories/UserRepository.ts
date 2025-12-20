/* eslint-disable @typescript-eslint/no-explicit-any */
import RiderModel from '../models/Rider';
import UserModel, { Address, User } from '../models/User';
import VendorModel from '../models/Vendor';
import WalletModel from '../models/Wallet';
import { RiderSignUpType, VendorSignUpType } from '../types/auth';

class UserRepository {
    // Create a new user
    async createUser(data: Partial<User>): Promise<User> {
        const user = new UserModel(data);
        return await user.save();
    }

    // Find a user by ID
    async findUserById(userId: string, select = ''): Promise<User | null> {
        const user = await UserModel.findById(userId)
            .select(select)
            .populate('wallet');
        return user;
    }

    async findAll(options: any): Promise<any> {
        const page = parseInt(options.page as string, 10) || 1;
        const limit = parseInt(options.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (options.role) {
            filter.role = options.role;
        }

        if (options.status) {
            filter.status = options.status;
        }

        if (options.search) {
            filter.$or = [
                { firstName: { $regex: options.search, $options: 'i' } },
                { lastName: { $regex: options.search, $options: 'i' } },
                { email: { $regex: options.search, $options: 'i' } },
                { phoneNumber: { $regex: options.search, $options: 'i' } }
            ];
        }

        if (options.sortBy) {
            options.sortBy = options.sortBy.replace(',', ' ');
        } else {
            options.sortBy = '-createdAt';
        }

        if (options.startDate && options.endDate) {
            filter.createdAt = {
                $gte: new Date(options.startDate),
                $lte: new Date(options.endDate)
            };
        }

        // virtually order counts for userIds
        if (options.role === 'user') {
            options.sortBy = '-orderCount ' + options.sortBy;
        }

        const [users, total] = await Promise.all([
            UserModel.find(filter).sort(options.sortBy).skip(skip).limit(limit),
            UserModel.countDocuments(filter)
        ]);

        return {
            total,
            count: users.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: users
        };
    }

    // Find a user by email
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await UserModel.findOne({ email })
            .select('+password')
            .populate('kyc wallet');
        return user;
    }

    // Find a user by email
    async findUserByEmailOrPhone(
        email: string,
        phone: any
    ): Promise<User | null> {
        const user = await UserModel.findOne({
            $or: [{ email }, { phoneNumber: phone }]
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

    // Create a Customer User
    async createCustomerUser(data: Partial<User>): Promise<any> {
        // Create User
        const user = await UserModel.create(data);
        if (!user) throw new Error('Failed to create user');

        const userId = user._id;

        // Create Wallet
        const wallet = await WalletModel.create({
            role: 'user',
            owner: userId.toString()
        });
        if (!wallet) throw new Error('Failed to create wallet');

        return { user, wallet };
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
            wallet = await WalletModel.create({
                role: 'vendor',
                owner: userId.toString()
            });
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
    async createRiderUser(userData: RiderSignUpType) {
        let user, rider, wallet;
        try {
            // Create User
            user = await UserModel.create(userData);
            if (!user) throw new Error('Failed to create user');

            const userId = user._id;

            // Create Rider
            rider = await RiderModel.create({ ...userData, userId });
            if (!rider) throw new Error('Failed to create rider');

            const riderId = rider._id;

            // Create Wallet
            wallet = await WalletModel.create({
                role: 'rider',
                owner: userId.toString()
            });
            if (!wallet) throw new Error('Failed to create wallet');

            return { user, rider, wallet };
        } catch (error) {
            // Rollback logic
            if (wallet) await WalletModel.deleteOne({ _id: wallet._id });
            if (rider) await RiderModel.deleteOne({ _id: rider._id });
            if (user) await UserModel.deleteOne({ _id: user._id });
            throw error;
        }
    }

    // Additional user-specific methods...
}

export default new UserRepository();
