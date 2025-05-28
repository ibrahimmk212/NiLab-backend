"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WalletRepository_1 = __importDefault(require("../repositories/WalletRepository"));
class WalletService {
    async initDebitAccount(payload) {
        const { amount, userId } = payload;
        const userWallet = await WalletRepository_1.default.getWalletByUser(userId);
        if (!userWallet) {
            return {
                success: false,
                message: `Wallet not found`
            };
        }
        const currentBalance = userWallet.balance;
        // Check if funds is sufficient
        if (currentBalance < amount)
            return {
                success: false,
                message: `Insufficient Funds, Could not debit, available is ${currentBalance}`,
                currentBalance: currentBalance
            };
        const updateWallet = await WalletRepository_1.default.debitBalance(userWallet === null || userWallet === void 0 ? void 0 : userWallet.id, amount);
        if (!updateWallet)
            return { success: false, message: 'Failed to Debit wallet' };
        return {
            success: true,
            message: 'Wallet Debited',
            data: updateWallet
        };
    }
    async confirmDebitAccount(payload) {
        const { amount, userId } = payload;
        const userWallet = await WalletRepository_1.default.getWalletByUser(userId);
        if (!userWallet)
            return null;
        const updateWallet = await WalletRepository_1.default.debitLedger(userWallet === null || userWallet === void 0 ? void 0 : userWallet.id, amount);
        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to confirm wallet debit'
            };
        return {
            success: true,
            message: 'Wallet Debit confirmed'
        };
    }
    async initCreditAccount(payload) {
        const { amount, userId } = payload;
        const userWallet = await WalletRepository_1.default.getWalletByUser(userId);
        if (!userWallet)
            return { success: false, message: 'Failed to fetch wallet' };
        const updateWallet = await WalletRepository_1.default.creditLedger(userWallet === null || userWallet === void 0 ? void 0 : userWallet.id, amount);
        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to initiate wallet credit'
            };
        return {
            success: true,
            message: 'Wallet credit initiated'
        };
    }
    async confirmCreditAccount(payload) {
        const { amount, userId } = payload;
        const userWallet = await WalletRepository_1.default.getWalletByUser(userId);
        if (!userWallet)
            return { success: false, message: 'Failed to fetch user wallet' };
        const updateWallet = await WalletRepository_1.default.creditBalance(userWallet === null || userWallet === void 0 ? void 0 : userWallet.id, amount);
        if (!updateWallet)
            return {
                success: false,
                message: 'Failed to confirm wallet credit'
            };
        return {
            success: true,
            message: 'Wallet credit confirmed'
        };
    }
    async fundWallet(payload) {
        const { amount, userId } = payload;
        const wallet = await WalletRepository_1.default.getWalletByUser(userId);
        if (!wallet)
            return { success: false, message: 'Wallet not found' };
        const updateWallet = await WalletRepository_1.default.creditFullBalance(wallet === null || wallet === void 0 ? void 0 : wallet.id, amount);
        if (!updateWallet)
            return { success: false, message: 'Failed to fund wallet' };
        return {
            success: true,
            message: 'Wallet funded'
        };
    }
    async directDebitWallet(payload) {
        const { amount, userId } = payload;
        try {
            const wallet = await WalletRepository_1.default.getWalletByUser(userId);
            if (!wallet)
                return {
                    success: false,
                    message: 'Wallet not found'
                };
            if (wallet.balance < amount) {
                return {
                    success: false,
                    message: 'Insufficient balance'
                };
            }
            const updateWallet = await WalletRepository_1.default.debitFullBalance(wallet === null || wallet === void 0 ? void 0 : wallet.id, amount);
            if (!updateWallet)
                return { success: false, message: 'Failed wallet debit' };
            return {
                success: true,
                message: 'Wallet debited'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || "Could not debit wallet"
            };
        }
    }
}
exports.default = new WalletService();
