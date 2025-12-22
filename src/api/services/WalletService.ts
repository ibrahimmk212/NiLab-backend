/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto';
import monnify from '../libraries/monnify';
import { Wallet } from '../models/Wallet';
import TransactionRepository from '../repositories/TransactionRepository';
import WalletRepository from '../repositories/WalletRepository';
import { CreateWalletType, InitDebitType } from '../types/wallet';
import mongoose from 'mongoose';

interface IWalletService {
    getWallet(walletId: any): Promise<any>;
    createWallet(payload: CreateWalletType): Promise<any>;
    initDebitAccount(payload: InitDebitType): Promise<any>;
    confirmDebitAccount(payload: InitDebitType): Promise<any>;
    initCreditAccount(payload: InitDebitType): Promise<any>;
    confirmCreditAccount(payload: InitDebitType): Promise<any>;
    fundWallet(payload: InitDebitType): Promise<any>;
    directDebitWallet(payload: InitDebitType): Promise<any>;
}

class WalletService implements IWalletService {
    async getWallet(walletId: any): Promise<Wallet | any> {
        const wallet = await WalletRepository.findWalletById(walletId);

        if (!wallet) {
            return {
                success: false,
                message: `Wallet not found`
            };
        }
        return wallet;
    }

    async getAllWallets(options: any) {
        return await WalletRepository.findAllWallets(options);
    }
    async createWallet(payload: CreateWalletType): Promise<Wallet | any> {
        const wallet = await WalletRepository.getWalletByOwner(
            payload.role,
            payload.owner
        );

        if (wallet) {
            return false;
        }

        return await WalletRepository.createWallet({
            role: payload.role,
            owner: payload.owner
        });
    }
    async getBanks(): Promise<any> {
        const banks = await monnify.getBanks();

        if (!banks.requestSuccessful) {
            return {
                success: false,
                message: banks.responseMessage,
                data: []
            };
        }
        return {
            success: true,
            message: banks.responseMessage,
            data: banks.responseBody
        };
    }

    async bankEnquiry(data: {
        accountNumber: string;
        bankCode: string;
    }): Promise<any> {
        const account = await monnify.validateBankAccount(
            data.accountNumber,
            data.bankCode
        );
        if (!account.requestSuccessful) {
            return {
                success: false,
                message: account.responseMessage,
                data: {}
            };
        }
        return {
            success: true,
            message: account.responseMessage,
            data: account.responseBody
        };
    }
    async getMyWallet(payload: CreateWalletType): Promise<Wallet | any> {
        const wallet = await WalletRepository.getWalletByOwner(
            payload.role,
            payload.owner
        );
        if (!wallet) {
            return await WalletRepository.createWallet({
                role: payload.role,
                owner: payload.owner
            });
        }

        return wallet;
    }

    async initDebitAccount(payload: any): Promise<any> {
        const { amount, owner, role } = payload;
        const userWallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );
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

        const updateWallet = await WalletRepository.debitAvailableBalance(
            userWallet?.id,
            amount
        );

        if (!updateWallet)
            return { success: false, message: 'Failed to Debit wallet' };

        return {
            success: true,
            message: 'Wallet Debited',
            data: updateWallet
        };
    }
    async confirmDebitAccount(payload: InitDebitType): Promise<any> {
        const { amount, owner, role } = payload;
        const userWallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );
        if (!userWallet) return null;

        const updateWallet = await WalletRepository.debitPendingBalance(
            userWallet?.id,
            amount
        );

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
    async initCreditAccount(payload: any): Promise<any> {
        const { amount, owner, role } = payload;
        const userWallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );

        if (!userWallet)
            return { success: false, message: 'Failed to fetch wallet' };

        const updateWallet = await WalletRepository.creditPendingBalance(
            userWallet?.id,
            amount
        );

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
    async confirmCreditAccount(payload: InitDebitType): Promise<any> {
        const { amount, owner, role } = payload;
        const userWallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );

        if (!userWallet)
            return { success: false, message: 'Failed to fetch user wallet' };

        const updateWallet = await WalletRepository.creditAvailableBalance(
            userWallet?.id,
            amount
        );

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
    async fundWallet(payload: InitDebitType): Promise<any> {
        const { amount, owner, role } = payload;
        const wallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );

        if (!wallet) return { success: false, message: 'Wallet not found' };

        const updateWallet = await WalletRepository.creditFullBalance(
            wallet?.id,
            amount
        );
        if (!updateWallet)
            return { success: false, message: 'Failed to fund wallet' };

        return {
            success: true,
            message: 'Wallet funded'
        };
    }

    async adminFundAvailableWallet(payload: any): Promise<any> {
        const { amount, owner, remark, role } = payload;

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            throw new Error('Invalid owner id');
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Invalid amount');
        }

        const wallet = await WalletRepository.getWalletByOwner(role, owner);
        if (!wallet) throw new Error('Wallet not found');

        const updated = await WalletRepository.creditAvailableBalance(
            wallet.id,
            parsedAmount
        );

        if (!updated) {
            throw new Error('Failed to fund wallet');
        }

        const reference = `ADFUNDED-${Date.now()}-${randomBytes(4).toString(
            'hex'
        )}`;

        const transaction = await TransactionRepository.createTransaction({
            user: role === 'user' ? owner : undefined,
            vendor: role === 'vendor' ? owner : undefined,
            rider: role === 'rider' ? owner : undefined,
            reference,
            amount: parsedAmount,
            type: 'CREDIT',
            remark,
            status: 'successful'
        });

        return {
            success: true,
            message: 'Wallet funded',
            data: { wallet, transaction }
        };
    }

    async adminDeductAvailableWallet(payload: any): Promise<any> {
        const { amount, owner, remark, role } = payload;

        if (!mongoose.Types.ObjectId.isValid(owner)) {
            throw new Error('Invalid owner id');
        }

        const parsedAmount = Number(amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Invalid amount');
        }

        const wallet = await WalletRepository.getWalletByOwner(role, owner);
        if (!wallet) throw new Error('Wallet not found');

        const updated = await WalletRepository.debitAvailableBalance(
            wallet.id,
            parsedAmount
        );

        if (!updated) {
            throw new Error('Failed to deduct wallet');
        }

        const reference = `ADDEDUCTED-${Date.now()}-${randomBytes(4).toString(
            'hex'
        )}`;

        const transaction = await TransactionRepository.createTransaction({
            user: role === 'user' ? owner : undefined,
            vendor: role === 'vendor' ? owner : undefined,
            rider: role === 'rider' ? owner : undefined,
            reference,
            amount: parsedAmount,
            type: 'DEBIT',
            remark,
            status: 'successful'
        });

        return {
            success: true,
            message: 'Wallet debited successfully',
            data: { wallet: updated, transaction }
        };
    }

    async directDebitWallet(payload: InitDebitType): Promise<any> {
        const { amount, owner, role } = payload;
        const wallet: any = await WalletRepository.getWalletByOwner(
            role,
            owner
        );

        if (!wallet) return null;

        const updateWallet = await WalletRepository.debitFullBalance(
            wallet?.id,
            amount
        );
        if (!updateWallet)
            return { success: false, message: 'Failed wallet debit' };

        return {
            success: true,
            message: 'Wallet debited'
        };
    }
}

export default new WalletService();
