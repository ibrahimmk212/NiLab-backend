/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto';
import monnify from '../libraries/monnify';
import { Wallet } from '../models/Wallet';
import { Order } from '../models/Order';
import TransactionRepository from '../repositories/TransactionRepository';
import WalletRepository from '../repositories/WalletRepository';
import { CreateWalletType, InitDebitType } from '../types/wallet';
import mongoose from 'mongoose';
import ConfigurationModel from '../models/Configuration';

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

class WalletService {
    async getWallet(walletId: any): Promise<Wallet | any> {
        const wallet = await WalletRepository.findWalletById(walletId);

        if (!wallet) {
            throw new Error(`Wallet not found`);
        }
        return wallet;
    }

    async getSystemWallet() {
        let wallet = await WalletRepository.getWalletByOwner('system');

        if (!wallet) {
            wallet = await WalletRepository.createWallet({ role: 'system' });
        }

        return wallet;
    }

    async adminFundAvailableWallet(payload: any) {
        const { amount, owner, role, remark } = payload;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await WalletRepository.getWalletByOwner(role, owner);
            if (!wallet) throw new Error('Wallet not found');

            const updated = await WalletRepository.creditAvailableBalance(
                wallet.id,
                amount,
                session
            );

            await TransactionRepository.createTransaction(
                {
                    userId: owner,
                    role,
                    reference: `ADMIN-CREDIT-${Date.now()}`,
                    amount,
                    type: 'CREDIT',
                    category: 'ADMIN',
                    remark,
                    status: 'successful'
                },
                session
            );

            await session.commitTransaction();
            return { success: true, data: updated };
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    async adminDeductAvailableWallet(payload: any) {
        const { amount, owner, role, remark } = payload;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const wallet = await WalletRepository.getWalletByOwner(role, owner);
            if (!wallet) throw new Error('Wallet not found');

            if (wallet.availableBalance < amount)
                throw new Error('Insufficient balance');

            const updated = await WalletRepository.debitAvailableBalance(
                wallet.id,
                amount,
                session
            );

            await TransactionRepository.createTransaction(
                {
                    userId: owner,
                    role,
                    reference: `ADMIN-DEBIT-${Date.now()}`,
                    amount,
                    type: 'DEBIT',
                    category: 'ADMIN',
                    remark,
                    status: 'successful'
                },
                session
            );

            await session.commitTransaction();
            return { success: true, data: updated };
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    async getOrCreateWallet(payload: CreateWalletType): Promise<Wallet | any> {
        const wallet = await WalletRepository.getWalletByOwner(
            payload.role,
            payload.owner
        );

        if (wallet) {
            return wallet;
        }

        return await WalletRepository.createWallet({
            role: payload.role,
            owner: payload.owner
        });
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

    async initDebitAccount(payload: any) {
        const { amount, owner, role } = payload;

        const wallet = await WalletRepository.getWalletByOwner(role, owner);
        if (!wallet) throw new Error('Wallet not found');

        if (wallet.availableBalance < amount) {
            return { success: false, message: 'Insufficient balance' };
        }

        const updated = await WalletRepository.debitAvailableBalance(
            wallet.id,
            amount
        );

        return {
            success: true,
            message: 'Wallet debited',
            data: updated
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

        if (!updateWallet) throw new Error(`Failed to confirm wallet debit`);

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

        if (!userWallet) throw new Error('Failed to fetch wallet');

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
    async transfer({
        from,
        to,
        amount,
        reference,
        remark,
        type,
        category
    }: {
        from: { role: string; owner?: string };
        to: { role: string; owner?: string };
        amount: number;
        reference: string;
        remark: string;
        type: 'CREDIT' | 'DEBIT';
        category: 'ORDER' | 'COMMISSION' | 'DELIVERY' | 'ADMIN';
    }) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const fromWallet = await WalletRepository.getWalletByOwner(
                from.role,
                from.owner
            );
            const toWallet = await WalletRepository.getWalletByOwner(
                to.role,
                to.owner
            );

            if (!fromWallet || !toWallet) throw new Error('Wallet not found');

            if (fromWallet.availableBalance < amount)
                throw new Error('Insufficient balance');

            await WalletRepository.debitAvailableBalance(
                fromWallet.id,
                amount,
                session
            );

            await WalletRepository.creditAvailableBalance(
                toWallet.id,
                amount,
                session
            );

            await TransactionRepository.createTransaction(
                {
                    fromWallet: fromWallet.id,
                    toWallet: toWallet.id,
                    reference,
                    amount,
                    type,
                    category,
                    remark,
                    status: 'successful'
                },
                session
            );

            await session.commitTransaction();
            return { success: true };
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    async mergeDuplicateWallets() {
        return await WalletRepository.mergeDuplicateWallets();
    }

    async deleteWallet(walletId: string) {
        return await WalletRepository.deleteWallet(walletId);
    }
}

export default new WalletService();
