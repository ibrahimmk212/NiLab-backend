/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import PayoutModel, { Payout } from '../models/Payout';
import WalletModel from '../models/Wallet';
import TransactionModel from '../models/Transaction';
import { generateReference } from '../../utils/keygen/idGenerator';
import appConfig from '../../config/appConfig';
import monnify from '../libraries/monnify';

class PayoutRepository {
    //  Request a payout

    async requestPayout(
        userId: string,
        amount: number,
        bankName: string,
        accountNumber: string,
        bankCode: string
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const validation = await monnify.validateBankAccount(
                accountNumber,
                bankCode
            );

            if (!validation.requestSuccessful) {
                throw new Error(
                    'Invalid bank account details. Please check and try again.'
                );
            }

            const accountName = validation.responseBody.accountName;
            // 1. Atomic Balance Check and Move to Pending
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

            if (!wallet)
                throw new Error('Insufficient balance or wallet not found');

            // 2. Prevent multiple pending payouts if desired
            const existing = await PayoutModel.findOne({
                userId,
                status: 'pending'
            }).session(session);
            if (existing)
                throw new Error('You already have a pending payout request');

            // 3. Create the Payout Record
            const [payout] = await PayoutModel.create(
                [
                    {
                        userId,
                        walletId: wallet._id,
                        amount,
                        bankName,
                        accountNumber,
                        accountName,
                        bankCode,
                        status: 'pending'
                    }
                ],
                { session }
            );

            // 4. LOG THE "HOLD" TRANSACTION
            // This allows the user to see WHY their available balance dropped
            await TransactionModel.create(
                [
                    {
                        userId,
                        role: wallet.role,
                        reference: generateReference('WTH'),
                        amount,
                        type: 'DEBIT',
                        category: 'WITHDRAWAL',
                        status: 'pending',
                        remark: `Withdrawal request for ${amount} initiated`,
                        balanceBefore: wallet.availableBalance + amount,
                        balanceAfter: wallet.availableBalance
                    }
                ],
                { session }
            );

            await session.commitTransaction();
            return payout;
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    //  complete (approve) payout
    async finalizePayout(payoutId: string, session: mongoose.ClientSession) {
        // eslint-disable-next-line no-useless-catch
        try {
            const payout = await PayoutModel.findOne({
                _id: payoutId,
                status: 'pending'
            }).session(session);
            if (!payout) throw new Error('Invalid or already processed payout');

            const wallet = await WalletModel.findOneAndUpdate(
                {
                    _id: payout.walletId,
                    pendingBalance: { $gte: payout.amount }
                },
                { $inc: { pendingBalance: -payout.amount } },
                { new: true, session }
            );

            if (!wallet) throw new Error('Pending balance mismatch');

            // Update original transaction or create a completion log
            await TransactionModel.create(
                [
                    {
                        userId: payout.userId,
                        role: wallet.role,
                        reference: `PAYOUT-${payout._id}`,
                        amount: payout.amount,
                        type: 'DEBIT',
                        category: 'WITHDRAWAL',
                        status: 'successful',
                        remark: 'Payout successfully disbursed to bank account'
                    }
                ],
                { session }
            );

            payout.status = 'completed'; // Mark as completed locally
            await payout.save({ session });

            return payout;
        } catch (e) {
            throw e;
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

    async getPayoutsSummary() {
        return await PayoutModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalRequested: { $sum: '$amount' },
                    totalSuccessful: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'completed'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalPending: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'pending'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalRejected: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'rejected'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRequested: 1,
                    totalSuccessful: 1,
                    totalPending: 1,
                    totalRejected: 1,
                    requestCount: '$count'
                }
            }
        ]);
    }
}

export default new PayoutRepository();
