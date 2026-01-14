/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import ConfigurationService from './ConfigurationService';
import WalletService from './WalletService';
import {
    generateReference,
    generateShortCode
} from '../../utils/keygen/idGenerator';
import SettlementService from './SettlementService';

class OrderService {
    /**
     * POINT ZERO: Create Order
     * This method now handles NanoID generation and stores the commission
     * snapshot so financial records remain consistent if config changes.
     */
    async createOrder(orderData: Partial<Order>): Promise<Order> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            // 1. Generate Clean NanoIDs
            const orderCode = generateShortCode(); // e.g., 829102
            const paymentRef = generateReference('ORD'); // e.g., ORD-K7W2J9P4

            // 2. Snapshot Commission and calculate totals
            // Important: We save the commission % at the time of order
            const orderPayload: Partial<Order> = {
                ...orderData,
                code: orderCode,
                paymentReference: paymentRef,
                commission: config.vendorCommission,
                status: 'pending'
            };

            const order = await OrderRepository.createOrder(
                orderPayload,
                session
            );

            // 3. If paying via Wallet, we trigger the escrow immediately
            if (orderData.paymentType === 'wallet') {
                await WalletService.initCreditAccount({
                    amount: order.totalAmount,
                    owner: order.user,
                    role: 'user'
                });
                // Note: Actual movement to System Wallet happens on payment confirmation
            }

            await session.commitTransaction();
            return order;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async createPackageOrder(data: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            // Calculate delivery fee for the package
            const deliveryFee = await this.calculateDeliveryFee(
                data.distance ?? 0
            );
            // Usually, package orders have a flat service fee or percentage
            const serviceFee = config.baseServiceFee || 100;

            const orderData = {
                ...data,
                code: generateReference('PKG'),
                paymentReference: generateReference('ORD'),
                orderType: 'delivery',
                deliveryFee,
                serviceFee,
                totalAmount: (data.amount || 0) + deliveryFee + serviceFee,
                status: 'pending'
            };

            const order = await OrderRepository.createOrder(orderData, session);

            await session.commitTransaction();
            return order;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Finalize Order: The moment money moves from Escrow to Vendor/Rider
     */
    async completeOrder(orderId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Fetch Order and check status
            const order = await OrderRepository.findOrderById(orderId);
            if (!order) throw new Error('Order not found');

            // Prevent double settlement
            if (order.status === 'delivered' || order.completed) {
                return order;
            }

            // 2. TRIGGER POINT ZERO SETTLEMENT
            // This handles Vendor Net, Rider Net, and System Revenue
            await SettlementService.settleOrder(order);

            // 3. Update Order Status after successful settlement
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                {
                    status: 'delivered',
                    completed: true,
                    deliveredAt: Date.now()
                },
                session
            );

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            // If settlement fails, the order status update is rolled back
            await session.abortTransaction();
            console.error(
                `[ORDER_SERVICE_ERROR] Completion failed for ${orderId}:`,
                error
            );
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Standard status update wrapper
     */
    async updateOrderStatus(orderId: string, updateData: any) {
        // If the update is specifically setting status to delivered,
        // redirect to the completeOrder method to ensure settlement happens.
        if (updateData.status === 'delivered') {
            return await this.completeOrder(orderId);
        }

        return await OrderRepository.updateOrder(orderId, updateData);
    }

    /**
     * Calculation logic using System Config
     */
    async calculateDeliveryFee(distanceInMeters: number): Promise<number> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) return 0;

        const distanceInKm = distanceInMeters / 1000;
        const totalDeliveryFee =
            config.baseDeliveryFee + distanceInKm * config.feePerKm;

        return Math.max(totalDeliveryFee, config.baseDeliveryFee);
    }

    async calculateServiceFee(subTotal: number): Promise<number> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) return 0;

        // vendorCommission is a percentage (e.g. 15)
        return (subTotal * config.vendorCommission) / 100;
    }

    // --- Standard Repository Wrappers ---

    async getOrderById(orderId: string) {
        return await OrderRepository.findOrderById(orderId);
    }

    async getOrderByCode(code: string) {
        return await OrderRepository.findOrderByCode(code);
    }

    async updateOrder(orderId: string, update: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await OrderRepository.findOrderById(orderId);
            if (!order) throw new Error('Order not found');

            // Logic: If status is being changed to 'delivered'
            if (update.status === 'delivered' && order.status !== 'delivered') {
                await WalletService.settleCompletedOrder(order);
            }

            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                update,
                session
            );
            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async getAll(options: any) {
        return await OrderRepository.findAll(options);
    }

    async vendorAnalytics(vendorId: string, startDate: Date, endDate: Date) {
        return await OrderRepository.vendorAnalytics(
            vendorId,
            startDate,
            endDate
        );
    }
}

export default new OrderService();
