/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import TransactionModel, { Transaction } from '../models/Transaction';

class TransactionRepository {
    async createTransaction(
        data: Partial<Transaction>,
        session?: mongoose.ClientSession
    ): Promise<Transaction> {
        const transaction = new TransactionModel(data);
        return await transaction.save({ session });
    }

    async findTransactionById(
        transactionId: string
    ): Promise<Transaction | null> {
        return await TransactionModel.findById(transactionId);
    }

    // Find all vendor
    async findAll(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.user) {
            filter.user = options.user;
        }

        if (options.reference) {
            filter.reference = options.reference;
        }
        if (options.amount) {
            filter.amount = options.amount;
        }

        const [transactions, total] = await Promise.all([
            TransactionModel.find(filter)
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'user',
                    select: 'firstName lastName email phone'
                }),
            TransactionModel.countDocuments(filter)
        ]);

        return {
            total,
            count: transactions.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: transactions
        };
    }

    async findTransactionByReference(
        role: string,
        owner: string,
        paymentReference: string
    ): Promise<Transaction | null> {
        return await TransactionModel.findOne({
            reference: paymentReference,
            [role]: owner
        });
    }

    async getTransactionsByCustomer(
        user: string
    ): Promise<Transaction[] | null> {
        return await TransactionModel.find({ user }).sort({ createdAt: -1 });
    }

    async getTransactionsByVendor(
        vendor: string
    ): Promise<Transaction[] | null> {
        return await TransactionModel.find({ vendor }).sort({ createdAt: -1 });
    }

    async getTransactionsByRider(rider: string): Promise<Transaction[] | null> {
        return await TransactionModel.find({ rider }).sort({ createdAt: -1 });
    }

    async updateTransaction(
        transactionId: string,
        updateData: Partial<Transaction>
    ): Promise<Transaction | null> {
        return await TransactionModel.findByIdAndUpdate(
            transactionId,
            updateData,
            { new: true }
        );
    }

    async deleteTransaction(transactionId: string): Promise<Transaction | any> {
        return await TransactionModel.findByIdAndDelete(transactionId);
    }
}

export default new TransactionRepository();
