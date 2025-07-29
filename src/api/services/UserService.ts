import * as bcrypt from 'bcrypt';
import UserRepository from '../repositories/UserRepository';
import { Address, User } from '../models/User';
import { CreateUserType } from '../types/user';

interface IUserService {
    createUser(payload: any): Promise<any>;
    getUsers(): Promise<any[]>;
    getUserDetail(userId: string): Promise<any>;
    updateUser(userId: string, data: any): Promise<boolean>;
    deleteUser(userId: string): Promise<boolean>;
}

class UserService {
    async createUser(payload: CreateUserType): Promise<any> {
        const user = await UserRepository.findUserByKey(
            'phoneNumber',
            payload.phoneNumber
        );

        if (user) {
            throw new Error('phone must be unique');
        }


        return UserRepository.createUser({
            ...payload,
            password: payload.password
        });
    }
    async findUserById(id: string) {
        const user = await UserRepository.findUserById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async findByEmailOrPhone(email: string, phone: string) {
        const user = await UserRepository.findUserByEmailOrPhone(email, phone);
        return user;
    }
    getUsers(): Promise<any[]> {
        throw new Error('Method not implemented.');
    }

    async getUserDetail(userId: string): Promise<any> {
        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    async updateUser(userId: string, payload: any): Promise<User | null> {
        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return UserRepository.updateUser(userId, payload);
    }

    async addNewAddress(
        userId: string,
        newAddress: Address
    ): Promise<User | null> {
        return await UserRepository.addNewAddress(userId, newAddress);
    }

    async updateAddress(
        userId: string,
        addressId: string,
        addressData: Address
    ): Promise<User | null> {
        return await UserRepository.updateAddress(
            userId,
            addressId,
            addressData
        );
    }

    async deleteAddress(
        userId: string,
        addressId: string
    ): Promise<User | null> {
        return await UserRepository.deleteAddress(userId, addressId);
    }
    async deleteUser(userId: string): Promise<User | null> {
        const user = await UserRepository.findUserById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return UserRepository.deleteUser(userId);
    }
}

export default new UserService();
