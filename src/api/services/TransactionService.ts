/* eslint-disable @typescript-eslint/no-explicit-any */
import TransactionRepository from '../repositories/TransactionRepository';
import { Transaction } from '../models/Transaction';
import WalletService from './WalletService';

class TransactionService {
    async createTransaction(
        transactionData: Partial<Transaction>
    ): Promise<Transaction> {
        return await TransactionRepository.createTransaction(transactionData);
    }

    async getTransactionById(
        transactionId: string
    ): Promise<Transaction | null> {
        return await TransactionRepository.findTransactionById(transactionId);
    }

    async getTransactionByReference(
        role: string,
        owner: string,
        paymentReference: string
    ): Promise<Transaction | null> {
        return await TransactionRepository.findTransactionByReference(
            role,
            owner,
            paymentReference
        );
    }

    async getAll(options: any): Promise<any> {
        return await TransactionRepository.findAll(options);
    }

    async getTransactionsByVendor(
        vendorId: string
    ): Promise<Transaction[] | null> {
        return await TransactionRepository.getTransactionsByVendor(vendorId);
    }

    async getTransactionsByCustomer(
        customerId: string
    ): Promise<Transaction[] | null> {
        return await TransactionRepository.getTransactionsByCustomer(
            customerId
        );
    }

    async getTransactionsByRider(
        riderId: string
    ): Promise<Transaction[] | null> {
        return await TransactionRepository.getTransactionsByRider(riderId);
    }
    async updateTransaction(
        transactionId: string,
        updateData: Partial<Transaction>
    ): Promise<Transaction | null> {
        return await TransactionRepository.updateTransaction(
            transactionId,
            updateData
        );
    }

    async deleteTransaction(
        transactionId: string
    ): Promise<Transaction | null> {
        return await TransactionRepository.deleteTransaction(transactionId);
    }

    async payVendor(payload: Transaction): Promise<Transaction | null> {
        const transaction = await TransactionRepository.createTransaction(
            payload
        );

        const paid = WalletService.initCreditAccount({
            amount: transaction.amount,
            owner: transaction.userId,
            // reference: transaction.order.toString(),
            // remark: transaction.remark,
            role: 'vendor'
            // transactionId: transaction.id,
            // transactionType: transaction.type
        });
        return transaction;
    }

    // Additional transaction-specific business logic...
}

export default new TransactionService();
