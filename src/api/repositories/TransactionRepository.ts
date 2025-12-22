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

    async findAll(): Promise<Transaction[] | null> {
        return await TransactionModel.find().sort({ createdAt: -1 });
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
