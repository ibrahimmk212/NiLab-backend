/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { ClientSession } from 'mongoose';
import WalletRepository from '../repositories/WalletRepository';
import TransactionRepository from '../repositories/TransactionRepository';
import ConfigurationModel from '../models/Configuration';
import { generateReference } from '../../utils/keygen/idGenerator';
import OrderModel, { Order } from '../models/Order';
import PlatformRevenueService from './PlatformRevenueService';

class SettlementService {
    /**
     * Primary entry point for any order type
     */
    async settleOrder(
        order: Order,
        userIds: {
            vendor?: string;
            rider?: string;
            system: string;
        }
    ) {
        if (order.orderType === 'delivery') {
            return await this.settlePackageOrder(order, userIds);
        }
        return await this.settleProductOrder(order, userIds);
    }

    /**
     * SETTLEMENT: Product Order (Food/Grocery)
     * Involves Vendor, Rider, and System
     */
    async settleProductOrder(
        order: Order,
        userIds: {
            vendor?: string;
            rider?: string;
            system: string;
        },
        externalSession?: ClientSession
    ) {
        const session = externalSession || (await mongoose.startSession());
        if (!externalSession) session.startTransaction();

        try {
            // 1. RE-ENTRANCY GUARD
            // Check again inside the transaction to prevent race conditions
            const freshOrder = await OrderModel.findById(order._id).session(
                session
            );
            if (freshOrder?.isSettled) return;
            const config = await ConfigurationModel.findOne().session(session);
            if (!config) throw new Error('System configuration missing');

            // 1. Calculations
            const platformCommission =
                (order.amount * config.vendorCommission) / 100;
            const vendorNet = order.amount - platformCommission;

            const riderCommission =
                (order.deliveryFee * config.riderCommission) / 100;
            const riderNet = order.deliveryFee - riderCommission;

            const totalPlatformRevenue =
                platformCommission + riderCommission + order.serviceFee;

            // 2. Execute Wallet Movements
            await this.executeMovement(
                order,
                userIds,
                {
                    vendorAmount: vendorNet,
                    riderAmount: riderNet,
                    systemAmount: totalPlatformRevenue
                },
                session
            );

            // 3. Update Order Settlement Status
            await OrderModel.findByIdAndUpdate(
                order._id,
                {
                    isSettled: true,
                    settledAt: new Date()
                },
                { session }
            );

            // 4. Log Revenue
            await PlatformRevenueService.recordOrderRevenue(
                order,
                config,
                session
            );

            if (!externalSession) await session.commitTransaction();
            return { success: true };
        } catch (e) {
            if (!externalSession) await session.abortTransaction();
            throw e;
        } finally {
            if (!externalSession) session.endSession();
        }
    }

    /**
     * SETTLEMENT: Package Order (Parcel)
     * Involves Rider and System ONLY
     */
    async settlePackageOrder(
        order: Order,
        userIds: { vendor?: string; rider?: string; system: string }
    ) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationModel.findOne().session(session);
            if (!config) throw new Error('System configuration missing');

            // 1. Calculations (Usually platform takes a cut from delivery fee only)
            const riderCommission =
                (order.deliveryFee * config.riderCommission) / 100;
            const riderNet = order.deliveryFee - riderCommission;

            // Platform gets the commission from delivery + the service fee
            const totalPlatformRevenue = riderCommission + order.serviceFee;

            // 2. Execute Wallet Movements
            await this.executeMovement(
                order,
                userIds,
                {
                    vendorAmount: 0, // No vendor in parcel delivery
                    riderAmount: riderNet,
                    systemAmount: totalPlatformRevenue
                },
                session
            );

            await session.commitTransaction();
        } catch (e) {
            await session.abortTransaction();
            throw e;
        } finally {
            session.endSession();
        }
    }

    async refundOrder(order: any, customerId: string, reason: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find the System Wallet (Where the escrow money is)
            const systemWallet = await WalletRepository.findSystemWallet();
            // Find the Customer Wallet
            const customerWallet = await WalletRepository.getWalletByOwner(
                'user',
                customerId,
                session
            );

            if (!systemWallet || !customerWallet)
                throw new Error('Wallets not found');

            // 1. Check if the money is actually in System Pending
            if (systemWallet.pendingBalance < order.totalAmount) {
                throw new Error(
                    'Escrow balance mismatch. Please contact support.'
                );
            }

            // 2. THE REVERSAL MOVEMENT
            // Remove from System Pending
            systemWallet.pendingBalance -= order.totalAmount;
            // Add to Customer Available
            customerWallet.availableBalance += order.totalAmount;

            await systemWallet.save({ session });
            await customerWallet.save({ session });

            // 3. Update Order Status to prevent further actions
            order.status = 'cancelled';
            order.remark = reason || 'Order rejected by vendor';
            order.cancelledAt = new Date();
            await order.save({ session });

            // 4. Create Audit Log (Transaction)
            await TransactionRepository.createTransaction(
                {
                    userId: customerId,
                    role: 'user',
                    amount: order.totalAmount,
                    type: 'CREDIT',
                    category: 'REFUND',
                    status: 'successful',
                    reference: `REF-${order.code}-${Date.now()}`,
                    remark: `Refund for order ${order.code}: ${order.remark}`,
                    balanceBefore:
                        customerWallet.availableBalance - order.totalAmount,
                    balanceAfter: customerWallet.availableBalance
                },
                session
            );

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
    /**
     * Private Helper: Handles the actual atomic DB updates
     */
    private async executeMovement(
        order: Order,
        userIds: {
            vendor?: string;
            rider?: string;
            system: string;
        },
        amounts: {
            vendorAmount: number;
            riderAmount: number;
            systemAmount: number;
        },
        session: mongoose.ClientSession
    ) {
        const systemWallet = await WalletRepository.getWalletByOwner(
            'system',
            null,
            session
        );

        // 1. Debit the Escrow (Pending)
        await WalletRepository.debitPendingBalance(
            systemWallet!.id,
            order.totalAmount,
            session
        );

        // 2. Credit Vendor
        // 2. Credit Vendor
        if (amounts.vendorAmount > 0) {
            // Capture the updated wallet returned by the repository
            const updatedVendorWallet =
                await WalletRepository.creditAvailableBalance(
                    userIds.vendor!,
                    amounts.vendorAmount,
                    session
                );

            // Pass the UPDATED wallet to the log function
            await this.logTx(
                order,
                userIds.vendor,
                'vendor',
                amounts.vendorAmount,
                updatedVendorWallet, // Now has the newest balance
                session
            );
        }

        // 3. Credit Rider
        if (amounts.riderAmount > 0 && order.rider) {
            const riderWallet = await WalletRepository.getWalletByOwner(
                'rider',
                order.rider,
                session
            );
            await WalletRepository.creditAvailableBalance(
                riderWallet!.id,
                amounts.riderAmount,
                session
            );
            await this.logTx(
                order,
                order.rider,
                'rider',
                amounts.riderAmount,
                riderWallet,
                session
            );
        }

        // 4. Credit System (Profit/Revenue)
        await WalletRepository.creditAvailableBalance(
            systemWallet!.id,
            amounts.systemAmount,
            session
        );

        // NEW: Log System Revenue Transaction
        await this.logTx(
            order,
            systemWallet!.id,
            'system',
            amounts.systemAmount,
            systemWallet,
            session
        );
    }

    private async logTx(
        order: Order,
        userId: any,
        role: any,
        amount: number,
        wallet: any, // Pass the wallet here
        session: any
    ) {
        await TransactionRepository.createTransaction(
            {
                reference: generateReference('SETTLE'),
                order: order._id,
                userId,
                role,
                amount,
                type: 'CREDIT',
                category: 'SETTLEMENT',
                status: 'successful',
                balanceBefore: wallet.availableBalance - amount, // availableBalance was already updated by creditAvailableBalance
                balanceAfter: wallet.availableBalance,
                remark: `Settlement for order ${order.code}`
            },
            session
        );
    }
}

export default new SettlementService();
