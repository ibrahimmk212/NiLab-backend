import TransactionModel, { Transaction } from '../models/Transaction';

class TransactionRepository {
    async createTransaction(data: Transaction): Promise<Transaction> {
        const transaction = new TransactionModel(data);
        return await transaction.save();
    }

    async findTransactionById(
        transactionId: string
    ): Promise<Transaction | null> {
        return await TransactionModel.findById(transactionId);
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

    async deleteTransaction(
        transactionId: string
    ): Promise<Transaction | null> {
        return await TransactionModel.findByIdAndDelete(transactionId, {
            new: true
        });
    }

    // Additional transaction-specific methods...
}

export default new TransactionRepository();
