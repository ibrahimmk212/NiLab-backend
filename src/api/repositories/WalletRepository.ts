/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import WalletModel, { Wallet } from '../models/Wallet';

class WalletRepository {
    async findWalletById(walletId: string): Promise<Wallet | null> {
        return WalletModel.findById(walletId);
    }

    async createWallet(payload: any) {
        return await WalletModel.create(payload);
    }

    async getWalletByOwner(role: string, owner: any) {
        return await WalletModel.findOne({
            owner: new mongoose.Types.ObjectId(owner),
            role
        });
    }

    /* =========================
       AVAILABLE BALANCE
    ========================== */

    async creditAvailableBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findByIdAndUpdate(
            walletId,
            {
                $inc: { availableBalance: amount },
                $set: { prevAvailableBalance: '$availableBalance' }
            },
            { new: true, session }
        );
    }

    async debitAvailableBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            {
                _id: walletId,
                availableBalance: { $gte: amount } // 💥 prevents overdraft
            },
            {
                $inc: { availableBalance: -amount },
                $set: { prevAvailableBalance: '$availableBalance' }
            },
            { new: true, session }
        );
    }

    /* =========================
       PENDING BALANCE
    ========================== */

    async creditPendingBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findByIdAndUpdate(
            walletId,
            {
                $inc: { pendingBalance: amount },
                $set: { prevPendingBalance: '$pendingBalance' }
            },
            { new: true, session }
        );
    }

    async debitPendingBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            {
                _id: walletId,
                pendingBalance: { $gte: amount }
            },
            {
                $inc: { pendingBalance: -amount },
                $set: { prevPendingBalance: '$pendingBalance' }
            },
            { new: true, session }
        );
    }

    /* =========================
       FULL BALANCE
    ========================== */

    async creditFullBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findByIdAndUpdate(
            walletId,
            {
                $inc: {
                    availableBalance: amount,
                    pendingBalance: amount
                }
            },
            { new: true, session }
        );
    }

    async debitFullBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            {
                _id: walletId,
                availableBalance: { $gte: amount },
                pendingBalance: { $gte: amount }
            },
            {
                $inc: {
                    availableBalance: -amount,
                    pendingBalance: -amount
                }
            },
            { new: true, session }
        );
    }

    // Find all vendor
    async findAllWallets(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.role) {
            filter.role = options.role;
        }

        const [wallets, total] = await Promise.all([
            WalletModel.find(filter)
                .populate('categories marketCategory')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            WalletModel.countDocuments(filter)
        ]);

        return {
            total,
            count: wallets.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: wallets
        };
    }

    async deleteWallet(walletId: string): Promise<any | null> {
        return WalletModel.findByIdAndDelete(walletId);
    }
}

export default new WalletRepository();
