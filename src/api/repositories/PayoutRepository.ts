/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
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
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await WalletModel.findOneAndUpdate(
                {
                    owner: userId,
                    role: { $in: ['vendor', 'rider'] },
                    availableBalance: { $gte: amount }
                },
                {
                    $inc: {
                        availableBalance: -amount,
                        pendingBalance: amount
                    }
                },
                { new: true, session }
            );

            if (!wallet) throw new Error('Insufficient balance');

            const existing = await PayoutModel.exists(
                { userId, status: 'pending' }
                // { session }  TODO - add session support
            );
            if (existing) throw new Error('Pending payout exists');

            const payout = await PayoutModel.create(
                [
                    {
                        userId,
                        walletId: wallet._id,
                        amount,
                        bankName,
                        accountNumber,
                        accountName
                    }
                ],
                { session }
            );

            await session.commitTransaction();
            return payout[0];
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    //  complete (approve) payout
    async completePayout(payoutId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const payout = await PayoutModel.findOne({
                _id: payoutId,
                status: 'pending'
            }).session(session);

            if (!payout) throw new Error('Invalid payout');

            const wallet = await WalletModel.findOneAndUpdate(
                {
                    _id: payout.walletId,
                    pendingBalance: { $gte: payout.amount }
                },
                {
                    $inc: { pendingBalance: -payout.amount }
                },
                { new: true, session }
            );

            if (!wallet) throw new Error('Pending balance insufficient');

            await TransactionModel.create(
                [
                    {
                        userId: payout.userId,
                        role: wallet.role,
                        reference: `PAYOUT-${payout._id}`,
                        amount: payout.amount,
                        type: 'DEBIT',
                        category: 'ADMIN',
                        status: 'successful',
                        remark: 'Payout completed'
                    }
                ],
                { session }
            );

            payout.status = 'completed';
            await payout.save({ session });

            await session.commitTransaction();
            return payout;
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    // Reject Payout
    async rejectPayout(payoutId: string, reason: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const payout = await PayoutModel.findOne({
                _id: payoutId,
                status: 'pending'
            }).session(session);

            if (!payout) throw new Error('Invalid payout');

            const wallet = await WalletModel.findOneAndUpdate(
                {
                    _id: payout.walletId,
                    pendingBalance: { $gte: payout.amount }
                },
                {
                    $inc: {
                        pendingBalance: -payout.amount,
                        availableBalance: payout.amount
                    }
                },
                { new: true, session }
            );

            if (!wallet) throw new Error('Wallet rollback failed');

            payout.status = 'rejected';
            payout.rejectionReason = reason;
            await payout.save({ session });

            await session.commitTransaction();
            return payout;
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
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
        if (options.userId) filter.userId = options.userId;

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
