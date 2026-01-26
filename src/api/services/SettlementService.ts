/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { ClientSession } from 'mongoose';
import WalletRepository from '../repositories/WalletRepository';
import TransactionRepository from '../repositories/TransactionRepository';
import ConfigurationModel from '../models/Configuration';
import { generateReference } from '../../utils/keygen/idGenerator';
import OrderModel, { Order } from '../models/Order';
import PlatformRevenueService from './PlatformRevenueService';
import VendorRepository from '../repositories/VendorRepository';

class SettlementService {
    private roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
    async settleOrder(order: Order, riderUserId: string) {
        if (order.orderType === 'delivery') {
            return await this.settlePackageOrder(order, riderUserId);
        }
        return await this.settleProductOrder(order, riderUserId);
    }

    /**
     * SETTLEMENT: Product Order (Food/Grocery)
     * Involves Vendor, Rider, and System
     */
    async settleProductOrder(
        order: Order,
        riderUserId: string,
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

            // const get vendor User
            const vendorUser = await VendorRepository.findById(
                order.vendor._id.toString()
            );

            if (!vendorUser) throw new Error('Vendor not found');

            // 1. Calculations
            const platformCommission = this.roundToTwo(
                (order.amount * config.vendorCommission) / 100
            );
            const vendorNet = this.roundToTwo(
                order.amount - platformCommission
            );

            const riderCommission =
                (order.deliveryFee * config.riderCommission) / 100;
            const riderNet = order.deliveryFee - riderCommission;

            const totalPlatformRevenue =
                platformCommission + riderCommission + order.serviceFee;

            // 2. Execute Wallet Movements
            await this.executeMovement(
                order,
                {
                    vendor: vendorUser.userId.toString(),
                    rider: riderUserId,
                    system: 'system'
                },
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
        riderUserId: string,
        externalSession?: ClientSession
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
                {
                    rider: riderUserId,
                    system: 'system'
                },
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
            system?: string;
        },
        amounts: {
            vendorAmount: number;
            riderAmount: number;
            systemAmount: number;
        },
        session: mongoose.ClientSession
    ) {
        // 1. Get the System Wallet (The Escrow source)
        const systemWallet = await WalletRepository.getWalletByOwner(
            'system',
            null,
            session
        );
        if (!systemWallet) throw new Error('System wallet not found');

        // 2. Debit the System Pending Balance (Escrow release)
        // We don't necessarily need to log this specific debit as a settlement CREDIT
        await WalletRepository.debitPendingBalance(
            systemWallet.id,
            order.totalAmount,
            session
        );

        // Inside executeMovement
        // 3. Credit Vendor
        if (amounts.vendorAmount > 0 && userIds.vendor) {
            // Ensure this is the USER ID, not the VENDOR entity ID
            const vendorUserId = userIds.vendor.toString();

            const vendorWallet = await WalletRepository.getWalletByOwner(
                'vendor',
                vendorUserId,
                session
            );

            const updatedVendor = await WalletRepository.creditAvailableBalance(
                vendorWallet!.id,
                amounts.vendorAmount,
                session
            );

            await this.logTx(
                order,
                vendorUserId, // Log the User ID
                'vendor',
                amounts.vendorAmount,
                updatedVendor,
                session
            );
        }

        // 4. Credit Rider
        if (amounts.riderAmount > 0 && userIds.rider) {
            const riderUserId = userIds.rider.toString(); // Ensure this is the User ID

            const riderWallet = await WalletRepository.getWalletByOwner(
                'rider',
                riderUserId,
                session
            );

            const updatedRider = await WalletRepository.creditAvailableBalance(
                riderWallet!.id,
                amounts.riderAmount,
                session
            );

            await this.logTx(
                order,
                riderUserId, // Log the User ID
                'rider',
                amounts.riderAmount,
                updatedRider,
                session
            );
        }

        // 5. Credit System (Final Profit)
        // CAPTURE the returned updated wallet
        const finalSystemWallet = await WalletRepository.creditAvailableBalance(
            systemWallet.id,
            amounts.systemAmount,
            session
        );
        await this.logTx(
            order,
            null,
            'system',
            amounts.systemAmount,
            finalSystemWallet,
            session
        );
    }

    private async logTx(
        order: Order,
        userId: any,
        role: any,
        amount: number,
        wallet: any,
        session: any
    ) {
        // Safety Check: If wallet is null, throw a descriptive error instead of a TypeError
        if (!wallet) {
            throw new Error(
                `LogTx failed: Wallet for role ${role} (ID: ${userId}) is null.`
            );
        }

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
                balanceBefore: (wallet.availableBalance || 0) - amount,
                balanceAfter: wallet.availableBalance || 0,
                remark: `Settlement for order ${order.code}`
            },
            session
        );
    }
}

export default new SettlementService();
