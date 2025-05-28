"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Wallet_1 = __importDefault(require("../models/Wallet"));
class WalletRepository {
    async createWallet(data) {
        const wallet = new Wallet_1.default(data);
        return await wallet.save();
    }
    async findWalletById(walletId) {
        return await Wallet_1.default.findById(walletId);
    }
    async debitLedger(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async creditLedger(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async debitFullBalance(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async creditFullBalance(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async debitBalance(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async creditBalance(walletId, amount) {
        const wallet = await Wallet_1.default.findById(walletId);
        if (!wallet)
            throw new Error('Wallet not found');
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
    async updateWallet(walletId, updateData) {
        return await Wallet_1.default.findByIdAndUpdate(walletId, updateData, {
            new: true
        });
    }
    async getWalletByUser(userId) {
        return await Wallet_1.default.findOne({ userId });
    }
    async getWalletByKey(key, value) {
        return await Wallet_1.default.findOne({ [key]: value });
    }
    async deleteWallet(walletId) {
        return await Wallet_1.default.findByIdAndDelete(walletId, {
            new: true
        });
    }
}
exports.default = new WalletRepository();
