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
import ProductModel from '../models/Product';
import VendorModel from '../models/Vendor';
import UserRepository from '../repositories/UserRepository';
import { Address } from '../models/User';
import { calculateStraightDistance } from '../../utils/helpers';

class OrderService {
    private roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
    /**
     * POINT ZERO: Create Order
     * This method now handles NanoID generation and stores the commission
     * snapshot so financial records remain consistent if config changes.
     */
    async createOrder(data: any): Promise<Order> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');
            console.log('config: ', config);

            // 1. Get Vendor (Pickup) and Customer (Destination)
            const vendor = await VendorModel.findById(data.vendorId).session(
                session
            );
            if (!vendor) throw new Error('Vendor not found');
            console.log('vendor: ', vendor);

            const customer = await UserRepository.findUserById(data.user);
            if (!customer) throw new Error('Customer not found');

            const deliveryAddress = customer.addresses.find(
                (addr: any) => addr._id.toString() === data.addressId
            );

            if (!deliveryAddress) throw new Error('Delivery address not found');
            console.log('deliveryAddress: ', deliveryAddress);

            // 2. ENRICH PRODUCTS & CALCULATE SUBTOTAL
            // We fetch the prices from the DB so the user can't fake them
            const productIds = data.products.map((p: any) => p.product);
            const dbProducts = await ProductModel.find({
                _id: { $in: productIds }
            }).session(session);

            let subtotal = 0;
            const enrichedProducts = data.products.map((p: any) => {
                const dbP = dbProducts.find(
                    (item) => item._id.toString() === p.product
                );
                if (!dbP) throw new Error(`Product not found: ${p.product}`);

                const lineTotal = dbP.price * p.quantity;
                subtotal += lineTotal;

                return {
                    product: dbP._id,
                    name: dbP.name,
                    category: dbP.category,
                    price: dbP.price,
                    quantity: p.quantity
                };
            });

            console.log('enrichedProducts: ', enrichedProducts);

            // 3. LOGISTICS (Hybrid Math)
            const straightKm = calculateStraightDistance(
                vendor.location.coordinates[1],
                vendor.location.coordinates[0],
                deliveryAddress.coordinates[1],
                deliveryAddress.coordinates[0]
            );

            const estimatedRoadKm = straightKm * 1.4; // Road Factor
            const deliveryFee = await this.calculateDeliveryFee(
                estimatedRoadKm * 1000
            );
            console.log('distance in KM: ', straightKm);
            console.log('estimated distance in KM: ', estimatedRoadKm);

            // 4. CALCULATE PLATFORM FEES (Rounded)
            const serviceFee = this.roundToTwo(
                (subtotal * config.vendorCommission) / 100
            );
            const vat = this.roundToTwo(
                (subtotal + deliveryFee) * (config.vatRate / 100 || 0)
            );

            // Calculate total and round one final time to be safe
            const totalAmount = this.roundToTwo(
                subtotal + deliveryFee + serviceFee + vat
            );

            // 5. ASSEMBLE PAYLOAD
            const orderPayload: any = {
                ...data,
                code: generateShortCode(),
                paymentReference: generateReference('ORD'),
                vendor: vendor._id,
                user: customer._id,
                products: enrichedProducts,
                pickup: {
                    coordinates: vendor.location.coordinates,
                    street: vendor.address
                },
                destination: {
                    coordinates: deliveryAddress.coordinates,
                    street: deliveryAddress.street,
                    city: deliveryAddress.city,
                    label: deliveryAddress.label
                },
                deliveryFee: this.roundToTwo(deliveryFee), // Also round delivery fee
                serviceFee,
                vat,
                amount: subtotal,
                totalAmount,
                commission: config.vendorCommission,
                orderType: 'products',
                status: 'pending'
            };

            const order = await OrderRepository.createOrder(
                orderPayload,
                session
            );

            // 6. WALLET ESCROW
            if (data.paymentType === 'wallet') {
                await WalletService.initDebitAccount({
                    amount: totalAmount,
                    owner: data.user,
                    role: 'user'
                });
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

    async createPackageOrder(data: any): Promise<Order> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            const deliveryFee = await this.calculateDeliveryFee(
                data.distance ?? 0
            );
            const serviceFee = config.baseServiceFee || 100;
            const totalAmount = (data.amount || 0) + deliveryFee + serviceFee;

            const orderData: Partial<Order> = {
                ...data,
                code: generateReference('PKG'),
                paymentReference: generateReference('ORD'),
                orderType: 'package', // Aligned with your Schema Enum
                deliveryFee,
                serviceFee,
                totalAmount,
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
    async completeOrder(orderId: string, userIds: any = {}): Promise<any> {
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
            await SettlementService.settleOrder(order, {
                vendor: userIds.vendor.toString(),
                rider: userIds.rider.toString(),
                system: 'system'
            });

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
        return Math.max(
            config.baseDeliveryFee + distanceInKm * config.feePerKm,
            config.baseDeliveryFee
        );
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
