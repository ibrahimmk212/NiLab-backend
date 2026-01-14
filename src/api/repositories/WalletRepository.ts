/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import WalletModel, { Wallet } from '../models/Wallet';
import { create } from 'domain';

class WalletRepository {
    async findWalletById(walletId: string): Promise<Wallet | null> {
        return WalletModel.findById(walletId);
    }

    async createWallet(payload: any) {
        return WalletModel.create(payload);
    }

    async getWalletByOwner(
        role: string,
        owner?: any,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        const query: any = { role };

        if (role !== 'system') {
            query.owner = new mongoose.Types.ObjectId(owner);
        }

        return WalletModel.findOneAndUpdate(
            query,
            { $setOnInsert: query },
            {
                new: true,
                upsert: true,
                session
            }
        );
    }

    /* =========================
       AVAILABLE BALANCE
    ========================== */

    async creditAvailableBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findByIdAndUpdate(
            walletId,
            { $inc: { availableBalance: amount } },
            { new: true, session }
        );
    }

    async debitAvailableBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            { _id: walletId, availableBalance: { $gte: amount } },
            { $inc: { availableBalance: -amount } },
            { new: true, session }
        );
    }

    /* =========================
       PENDING BALANCE (ESCROW)
    ========================== */

    async creditPendingBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findByIdAndUpdate(
            walletId,
            { $inc: { pendingBalance: amount } },
            { new: true, session }
        );
    }

    async debitPendingBalance(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            { _id: walletId, pendingBalance: { $gte: amount } },
            { $inc: { pendingBalance: -amount } },
            { new: true, session }
        );
    }

    async findAllWallets(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};
        if (options.role) filter.role = options.role;

        const [wallets, total] = await Promise.all([
            WalletModel.find(filter)
                .sort({ createdAt: -1 })
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
                totalPages: Math.ceil(total / limit)
            },
            data: wallets
        };
    }

    async releasePendingToAvailable(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            {
                _id: walletId,
                pendingBalance: { $gte: amount }
            },
            {
                $inc: {
                    pendingBalance: -amount,
                    availableBalance: amount
                }
            },
            { new: true, session }
        );
    }

    async rollbackPendingToAvailable(
        walletId: string,
        amount: number,
        session?: mongoose.ClientSession
    ) {
        if (amount <= 0) throw new Error('Invalid amount');

        return WalletModel.findOneAndUpdate(
            {
                _id: walletId,
                pendingBalance: { $gte: amount }
            },
            {
                $inc: {
                    pendingBalance: -amount,
                    availableBalance: amount
                }
            },
            { new: true, session }
        );
    }
}

export default new WalletRepository();
