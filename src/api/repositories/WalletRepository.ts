import WalletModel, { Wallet } from '../models/Wallet';

class WalletRepository {
    async createWallet(data: Partial<Wallet>): Promise<Wallet> {
        const wallet = new WalletModel(data);
        return await wallet.save();
    }

    async findWalletById(walletId: string): Promise<Wallet | null> {
        return await WalletModel.findById(walletId);
    }
    async debitLedger(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevLegderBalance = wallet.ledgerBalance;
        wallet.ledgerBalance -= amount;
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'debit',
        //     balanceAfterTransaction: wallet.ledgerBalance,
        //     description: 'Debit ledger'
        // }).save();

        return wallet;
    }
    async creditLedger(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevLegderBalance = wallet.ledgerBalance;
        wallet.ledgerBalance += amount;
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'credit',
        //     balanceAfterTransaction: wallet.ledgerBalance,
        //     description: 'Credit ledger'
        // }).save();

        return wallet;
    }
    async debitFullBalance(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevLegderBalance = wallet.ledgerBalance;
        wallet.prevBalance = wallet.balance;
        wallet.balance -= amount;
        wallet.ledgerBalance -= amount; // Assuming you want to debit both
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'debit',
        //     balanceAfterTransaction: wallet.balance,
        //     description: 'Debit balance'
        // }).save();

        return wallet;
    }
    async creditFullBalance(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevLegderBalance = wallet.ledgerBalance;
        wallet.prevBalance = wallet.balance;
        wallet.balance += amount;
        wallet.ledgerBalance += amount; // Assuming you want to credit both
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'debit',
        //     balanceAfterTransaction: wallet.balance,
        //     description: 'Debit balance'
        // }).save();

        return wallet;
    }
    async debitBalance(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevBalance = wallet.balance;
        wallet.balance -= amount;
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'credit',
        //     balanceAfterTransaction: wallet.balance,
        //     description: 'Credit balance'
        // }).save();

        return wallet;
    }
    async creditBalance(
        walletId: string,
        amount: number
    ): Promise<Wallet | null> {
        const wallet = await WalletModel.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        wallet.prevBalance = wallet.balance;
        wallet.balance += amount;
        await wallet.save();

        // await new WalletTransactionModel({
        //     walletId,
        //     amount,
        //     type: 'credit',
        //     balanceAfterTransaction: wallet.balance,
        //     description: 'Credit balance'
        // }).save();

        return wallet;
    }

    async updateWallet(
        walletId: string,
        updateData: Partial<Wallet>
    ): Promise<Wallet | null> {
        return await WalletModel.findByIdAndUpdate(walletId, updateData, {
            new: true
        });
    }

    // async getWalletByUser(userId: string) {
    //     return await WalletModel.findOne({ userId });
    // }

    async getWalletByKey(key: string, value: any) {
        console.log({ [key]: value });
        return await WalletModel.findOne({ [key]: value });
    }

    async getWalletByOwner(role: string, owner: any) {
        return await WalletModel.findOne({ role, owner });
    }

    async deleteWallet(walletId: string): Promise<Wallet | null> {
        return await WalletModel.findByIdAndDelete(walletId, {
            new: true
        });
    }

    // Additional wallet-specific methods...
}

export default new WalletRepository();
