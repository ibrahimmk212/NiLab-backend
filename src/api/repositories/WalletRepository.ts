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

    async findSystemWallet(): Promise<Wallet | null> {
        return WalletModel.findOne({ role: 'system' });
    }

    async getWalletByOwner(
        role: string,
        owner?: any,
        session?: mongoose.ClientSession
    ): Promise<Wallet | null> {
        // 1. Handle System Wallet separately
        if (role === 'system') {
            return WalletModel.findOneAndUpdate(
                { role: 'system' },
                {
                    $setOnInsert: {
                        role: 'system',
                        availableBalance: 0,
                        pendingBalance: 0
                    }
                },
                { new: true, upsert: true, session }
            );
        }

        if (!owner) throw new Error(`Owner ID is required for role: ${role}`);

        const ownerId = new mongoose.Types.ObjectId(
            typeof owner === 'string' ? owner : (owner._id || owner).toString()
        );

        // 2. CHECK FOR EXISTING WALLET FOR THIS OWNER (Any Role)
        const existingWallet = await WalletModel.findOne({
            owner: ownerId
        }).session(session || null);

        if (existingWallet) {
            // 3. VULNERABILITY FIX: Check if the role matches
            if (existingWallet.role !== role) {
                throw new Error(
                    `Security Violation: Owner ${ownerId} is already registered as a '${existingWallet.role}'. Cannot create/access wallet as '${role}'.`
                );
            }
            return existingWallet;
        }

        // 4. CREATE NEW WALLET ONLY IF NONE EXISTS
        return WalletModel.create(
            [
                {
                    owner: ownerId,
                    role: role,
                    availableBalance: 0,
                    pendingBalance: 0,
                    lockedBalance: 0
                }
            ],
            { session }
        ).then((res) => res[0]); // Mongoose returns an array for .create() with sessions
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
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;
        console.log(options);

        const filter: Record<string, any> = {};
        if (options.role) filter.role = options.role;
        if (options.owner) filter.owner = options.owner;
        if (options.availableBalance)
            filter.availableBalance = options.availableBalance;
        if (options.pendingBalance)
            filter.pendingBalance = options.pendingBalance;
        if (options.lockedBalance) filter.lockedBalance = options.lockedBalance;

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

    async deleteWallet(walletId: string) {
        return WalletModel.findByIdAndDelete(walletId);
    }

    // wallets merge
    async mergeDuplicateWallets() {
        const owners = await WalletModel.aggregate([
            { $match: { owner: { $exists: true } } },
            {
                $group: {
                    _id: '$owner',
                    count: { $sum: 1 },
                    wallets: { $push: '$$ROOT' }
                }
            },
            { $match: { count: { $gt: 1 } } } // Only find duplicates
        ]);

        for (const group of owners) {
            // Sort by creation date (oldest first)
            const sorted = group.wallets.sort(
                (a: any, b: any) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            );

            const primaryWallet = sorted[0];
            const duplicates = sorted.slice(1);

            let totalAvailable = primaryWallet.availableBalance;
            let totalPending = primaryWallet.pendingBalance;

            for (const dup of duplicates) {
                totalAvailable += dup.availableBalance;
                totalPending += dup.pendingBalance;
                await WalletModel.findByIdAndDelete(dup._id);
            }

            await WalletModel.findByIdAndUpdate(primaryWallet._id, {
                availableBalance: totalAvailable,
                pendingBalance: totalPending
            });

            console.log(
                `Merged ${duplicates.length} ghost wallets for owner ${group._id}`
            );
        }
    }
}

export default new WalletRepository();
