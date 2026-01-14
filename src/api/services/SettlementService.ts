/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { ClientSession } from 'mongoose';
import WalletRepository from '../repositories/WalletRepository';
import TransactionRepository from '../repositories/TransactionRepository';
import ConfigurationModel from '../models/Configuration';
import { generateReference } from '../../utils/keygen/idGenerator';
import { Order } from '../models/Order';
import PlatformRevenueService from './PlatformRevenueService';

class SettlementService {
    /**
     * Primary entry point for any order type
     */
    async settleOrder(order: Order) {
        if (order.orderType === 'delivery') {
            return await this.settlePackageOrder(order);
        }
        return await this.settleProductOrder(order);
    }

    /**
     * SETTLEMENT: Product Order (Food/Grocery)
     * Involves Vendor, Rider, and System
     */
    async settleProductOrder(order: Order, externalSession?: ClientSession) {
        const session = externalSession || (await mongoose.startSession());
        session.startTransaction();

        try {
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
                {
                    vendorAmount: vendorNet,
                    riderAmount: riderNet,
                    systemAmount: totalPlatformRevenue
                },
                session
            );

            // 3. Log Revenue
            await PlatformRevenueService.recordOrderRevenue(
                order,
                config,
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

    /**
     * SETTLEMENT: Package Order (Parcel)
     * Involves Rider and System ONLY
     */
    async settlePackageOrder(order: Order) {
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

    /**
     * Private Helper: Handles the actual atomic DB updates
     */
    private async executeMovement(
        order: Order,
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
        if (amounts.vendorAmount > 0) {
            const vendorWallet = await WalletRepository.getWalletByOwner(
                'vendor',
                order.vendor,
                session
            );
            await WalletRepository.creditAvailableBalance(
                vendorWallet!.id,
                amounts.vendorAmount,
                session
            );
            await this.logTx(
                order,
                order.vendor,
                'vendor',
                amounts.vendorAmount,
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
                session
            );
        }

        // 4. Credit System
        await WalletRepository.creditAvailableBalance(
            systemWallet!.id,
            amounts.systemAmount,
            session
        );
    }

    private async logTx(
        order: Order,
        userId: any,
        role: 'system' | 'user' | 'rider' | 'vendor' | undefined,
        amount: number,
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
                category: 'ORDER',
                status: 'successful',
                remark: `Settlement for ${order.code}`
            },
            session
        );
    }
}

export default new SettlementService();
