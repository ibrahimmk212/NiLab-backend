/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import PayoutModel, { Payout } from '../models/Payout';
import WalletModel from '../models/Wallet';
import TransactionModel from '../models/Transaction';

class PayoutRepository {
    //  Request a payout

    async requestPayout(
        userId: string,
        amount: number,
        bankName: string,
        accountNumber: string,
        accountName: string
    ): Promise<Payout> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user id');
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Invalid payout amount');
        }

        // 🚫 Check for existing pending payout
        const existingPending = await PayoutModel.exists({
            userId,
            status: 'pending'
        });

        if (existingPending) {
            throw new Error('You already have a pending payout request');
        }

        // 🔐 Atomic wallet update (safe)
        const wallet = await WalletModel.findOneAndUpdate(
            {
                owner: userId,
                availableBalance: { $gte: parsedAmount }
            },
            {
                $inc: {
                    availableBalance: -parsedAmount,
                    pendingBalance: parsedAmount
                }
            },
            { new: true }
        );

        if (!wallet) {
            throw new Error('Insufficient balance');
        }

        const payout = await PayoutModel.create({
            userId,
            amount: parsedAmount,
            status: 'pending',
            bankName,
            accountNumber,
            accountName
        });

        return payout;
    }

    //  complete (approve) payout
    async completePayout(payoutId: string) {
        const payout = await PayoutModel.findById(payoutId);

        if (!payout || payout.status !== 'pending') {
            throw new Error('Invalid payout');
        }

        const amount = Number(payout.amount);
        if (!Number.isFinite(amount)) {
            throw new Error('Invalid payout amount');
        }

        const wallet = await WalletModel.findOne({
            owner: payout.userId
        });

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        if (wallet.pendingBalance < amount) {
            throw new Error('Pending balance insufficient');
        }

        wallet.prevPendingBalance = wallet.pendingBalance;
        wallet.pendingBalance = Number(wallet.pendingBalance) - amount;

        await wallet.save();

        await TransactionModel.create({
            userId: payout.userId,
            role: 'user',
            reference: `PAYOUT-${Date.now()}`,
            amount,
            type: 'DEBIT',
            status: 'successful',
            remark: 'Payout completed'
        });

        payout.status = 'completed';
        await payout.save();

        return payout;
    }

    // Reject Payout
    async rejectPayout(payoutId: string, reason: string) {
        const payout = await PayoutModel.findById(payoutId);

        if (!payout || payout.status !== 'pending') {
            throw new Error('Invalid payout');
        }

        const amount = Number(payout.amount);
        if (!Number.isFinite(amount)) {
            throw new Error('Invalid payout amount');
        }

        const wallet = await WalletModel.findOne({
            owner: payout.userId
        });

        if (!wallet) {
            throw new Error('Wallet not found');
        }

        wallet.prevAvailableBalance = wallet.availableBalance;
        wallet.prevPendingBalance = wallet.pendingBalance;

        wallet.pendingBalance = Number(wallet.pendingBalance) - amount;
        wallet.availableBalance = Number(wallet.availableBalance) + amount;

        await wallet.save();

        payout.status = 'rejected';
        payout.rejectionReason = reason;
        await payout.save();

        return payout;
    }

    // Create a new payout
    async createPayout(data: any): Promise<Payout> {
        const payout = new PayoutModel(data);
        return await payout.save();
    }

    // Find a payout by ID
    async findById(vendorId: string): Promise<Payout | null> {
        const payout = await PayoutModel.findById({ _id: vendorId }).populate([
            { path: 'user' }
        ]);

        if (!payout) throw new Error('Payout not found');
        return payout;
    }
    async findByKey(key: string, value: string): Promise<Payout | null> {
        const payout = await PayoutModel.findOne({ [key]: value }).populate([
            { path: 'user' }
        ]);
        if (!payout) throw new Error('Payout not found');
        return payout;
    }

    // Find all payout
    async findAllPayouts(options: any) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.bankName) filter.bankName = options.bankName;
        if (options.accountName) filter.accountName = options.accountName;
        if (options.status) filter.status = options.status;

        const [payouts, total, summary] = await Promise.all([
            PayoutModel.find(filter)
                .populate('user')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            PayoutModel.countDocuments(filter),

            PayoutModel.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: null,
                        totalVolume: { $sum: '$amount' },
                        totalPaid: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'completed'] },
                                    '$amount',
                                    0
                                ]
                            }
                        }
                    }
                }
            ])
        ]);

        const totals = summary[0] || { totalPaid: 0, totalVolume: 0 };

        return {
            total,
            count: payouts.length,
            totalPaid: totals.totalPaid,
            totalVolume: totals.totalVolume,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: payouts
        };
    }

    // Update a payout by ID
    async update(
        vendorId: string,
        updateData: Partial<Payout>
    ): Promise<Payout | null> {
        return await PayoutModel.findByIdAndUpdate(vendorId, updateData, {
            new: true
        });
    }
}

export default new PayoutRepository();
