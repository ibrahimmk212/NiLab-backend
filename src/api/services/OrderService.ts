/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import ConfigurationService from './ConfigurationService';
import WalletService from './WalletService';
import PaymentService from './PaymentService';
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
import DeliveryRepository from '../repositories/DeliveryRepository';
import DeliveryModel from '../models/Delivery';
import DispatchRepository from '../repositories/DispatchRepository';
import NotificationService from './NotificationService';
import emails from '../libraries/emails';

class OrderService {
    private roundToTwo(num: number): number {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    async createOrder(data: any): Promise<Order> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const config = await ConfigurationService.getConfiguration();
            if (!config) throw new Error('System configuration not found');

            // 1. Get Vendor (Pickup) and Customer (Destination)
            const vendor = await VendorModel.findById(data.vendor).session(
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

            // 3. LOGISTICS (Hybrid Math)
            const straightKm = calculateStraightDistance(
                vendor.location.coordinates[1],
                vendor.location.coordinates[0],
                deliveryAddress.coordinates[1],
                deliveryAddress.coordinates[0]
            );

            const estimatedRoadKm = straightKm; // Road Factor
            const deliveryBaseFee = config.baseDeliveryFee;
            const feePerKm = config.feePerKm;

            let deliveryFee = 0;
            // if (estimatedRoadKm < 1) {
            //     deliveryFee = deliveryBaseFee;
            // } else {
            deliveryFee = feePerKm * estimatedRoadKm;
            // }

            console.log(
                'Calculated Charges: ',
                (feePerKm * estimatedRoadKm).toFixed(2) + subtotal.toFixed(2)
            );

            console.log('distance in KM: ', straightKm);
            console.log('estimated distance in KM: ', estimatedRoadKm);

            // 4. CALCULATE PLATFORM FEES (Rounded)
            // const serviceFee = this.roundToTwo(
            //     (subtotal * config.vendorCommission) / 100
            // );
            const vat = 0; //this.roundToTwo((subtotal + deliveryFee) * (config.vatRate / 100 || 0));

            // Calculate total and round one final time to be safe
            const totalAmount = this.roundToTwo(
                subtotal + deliveryFee
                //  + serviceFee
                //  + vat
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
                pickupLocation: vendor.location.coordinates,
                deliveryLocation: vendor.location.coordinates,
                destination: {
                    coordinates: deliveryAddress.coordinates,
                    street: deliveryAddress.street,
                    city: deliveryAddress.city,
                    label: deliveryAddress.label
                },

                deliveryFee: this.roundToTwo(deliveryFee), // Also round delivery fee
                // serviceFee,
                vat,
                amount: subtotal,
                totalAmount,
                commission: config.vendorCommission,
                orderType: 'products',
                status: 'pending'
            };

            // 6. PAY FOR ME LOGIC
            if (data.paymentType === 'pay-for-me') {
                orderPayload.payForMeToken = generateReference('PFM'); // Using similar generator
                // Set expiry to 40 minutes from now
                orderPayload.payForMeExpiresAt = new Date(
                    Date.now() + 40 * 60 * 1000
                );
                orderPayload.payForMeStatus = 'pending';
            }

            const order = await OrderRepository.createOrder(
                orderPayload,
                session
            );

            // 6. IMMEDIATE WALLET PAYMENT
            if (data.paymentType === 'wallet') {
                // 1. Check & Debit the user's available balance
                const debitResult = await WalletService.initDebitAccount({
                    amount: totalAmount,
                    owner: data.user,
                    role: 'user'
                });

                if (!debitResult.success) {
                    throw new Error(
                        'Insufficient wallet balance to complete order'
                    );
                }

                // 2. Mark the order as paid immediately
                order.paymentCompleted = true;
                await order.save({ session });

                // 3. Move funds to System Escrow (Pending)
                await WalletService.initCreditAccount({
                    amount: totalAmount,
                    owner: 'system', // This moves money into the system's "pendingBalance"
                    role: 'system'
                });

                // Notifications
                 try {
                    // Admin
                    await NotificationService.notifyAdmins(
                        'New Order Placed',
                        `Order ${order.code} has been placed via Wallet.`
                    );

                    // Vendor
                    if (vendor.userId) { // Assuming Vendor model links to a User via userId
                         await NotificationService.create({
                            userId: vendor.userId,
                            title: 'New Order',
                            message: `You have a new order: ${order.code}`,
                            status: 'unread'
                        });
                    }

                    // User
                    await NotificationService.create({
                        userId: customer._id,
                        title: 'Order Placed',
                        message: `Your order ${order.code} has been placed successfully.`,
                        status: 'unread'
                    });
                    
                    // Vendor Email (Optional if not handled elsewhere)
                     if (vendor.email) {
                        emails.vendorOrder(vendor.email, {
                            vendorName: vendor.name,
                            orderId: order.code,
                            orderItems: enrichedProducts,
                            orderDetailsUrl: `https://vendor.terminus.com/orders/${order._id}` // Example URL
                        });
                     }

                } catch (notifErr) {
                    console.error('Notification Error:', notifErr);
                }
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

    async completeOrder(orderId: string, riderUserId: string): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order = await OrderRepository.findOrderById(orderId);
            if (!order || order.isSettled) {
                await session.abortTransaction();
                return order;
            }

            // 1. FINANCIALS (Ensure session is passed here!)
            await SettlementService.settleOrder(order, riderUserId, session);

            // 2. ORDER UPDATE
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                {
                    status: 'delivered',
                    completed: true,
                    completedBy: order.completedBy,
                    deliveredAt: new Date(),
                    isSettled: true
                },
                session
            );

            // 3. DELIVERY UPDATE
            const delivery = await DeliveryRepository.getDeliveryByOrder(
                orderId
            );
            if (delivery) {
                await DeliveryRepository.updateDelivery(
                    delivery.id,
                    {
                        status: 'delivered',
                        actualDeliveryTime: new Date()
                    },
                    session
                );

                // 4. DISPATCH AUTO-COMPLETE
                if (delivery.dispatch) {
                    const dispatchId = delivery.dispatch.toString();

                    const pendingCount = await DeliveryModel.countDocuments({
                        dispatch: dispatchId,
                        status: { $ne: 'delivered' },
                        _id: { $ne: delivery._id } // Exclude current
                    }).session(session);

                    if (pendingCount === 0) {
                        // Pass session to repository!
                        await DispatchRepository.updateDispatch(
                            dispatchId,
                            {
                                status: 'completed',
                                endTime: new Date()
                            },
                            session
                        );
                    }
                }
            }

            await session.commitTransaction();

             // Notifications after commit
            try {
                // Determine User ID (order.user is populated?)
                // OrderRepository.findOrderById populates user and vendor
                const populatedOrder: any = order;

                if (populatedOrder.user) {
                    // In-App
                    await NotificationService.create({
                        userId: populatedOrder.user._id || populatedOrder.user,
                        title: 'Order Delivered',
                        message: `Your order ${populatedOrder.code} has been delivered. Enjoy!`,
                        status: 'unread'
                    });
                }

                if (populatedOrder.vendor) {
                    await NotificationService.create({
                         userId: populatedOrder.vendor.userId || populatedOrder.vendor, // Check Vendor model for user link
                         title: 'Order Delivered',
                         message: `Order ${populatedOrder.code} has been successfully delivered.`,
                         status: 'unread'
                    });
                }

            } catch (err) {
                 console.error('Completion Notification Error:', err);
            }

            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Standard status update wrapper
     */
    async updateOrderStatus(
        orderId: string,
        riderUserId: string,
        updateData: any
    ) {
        // If the update is specifically setting status to delivered,
        // redirect to the completeOrder method to ensure settlement happens.
        if (updateData.status === 'delivered') {
            return await this.completeOrder(orderId, riderUserId);
        }

        return this.updateOrder(orderId, { status: updateData.status });
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

    async getOrderforPaymentAndCheckout(orderId: string) {
        const order: any = await OrderRepository.findOrderById(orderId);
        return {
            ...order,
            user: order.user.id,
            vendor: order.vendor.id,
            products: order.products
        };
    }

    async getOrderByCode(code: string) {
        return await OrderRepository.findOrderByCode(code);
    }
    async updateOrder(orderId: string, update: any, reason?: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const order: any = await OrderRepository.findOrderById(orderId);
            if (!order) throw new Error('Order not found');

            // 1. Logic for CANCELLATION
            if (['canceled', 'cancelled'].includes(update.status)) {
                if (!reason)
                    throw new Error('Reason is required for cancellation');
                if (order.status === 'delivered' || order.isSettled) {
                    throw new Error('Cannot cancel a completed/settled order');
                }
                // Trigger Refund
                await SettlementService.cancelOrder(
                    order,
                    order.user._id.toString(),
                    reason || 'Cancelled by vendor'
                );
            }

            // 2. Logic for PREPARED (Delivery Creation)
            if (update.status === 'prepared' && order.status !== 'prepared') {
                const existingDelivery =
                    await DeliveryRepository.getDeliveryByOrder(orderId);
                if (!existingDelivery) {
                    const generatedDeliveryCode = generateShortCode(6);

                    await DeliveryModel.create(
                        [
                            {
                                order: order._id,
                                status: 'pending',
                                deliveryCode: generatedDeliveryCode,
                                deliveryFee: order.deliveryFee,
                                rider: null,
                                pickup: {
                                    ...order.pickup,
                                    state: order.vendor.state,
                                    coordinates:
                                        order.vendor.location.coordinates,
                                    street: order.vendor.address
                                },
                                state: order.vendor.state,
                                destination: order.destination,
                                senderDetails: {
                                    name: order.vendor.name,
                                    address: order.vendor.address,
                                    contactNumber: order.vendor.phoneNumber
                                },
                                receiverDetails: {
                                    name: `${order.user.firstName} ${order.user.lastName}`,
                                    address: order.destination.street,
                                    contactNumber: order.user.phoneNumber
                                }
                            }
                        ],
                        { session }
                    );
                }
                update.preparedAt = Date.now();
            }

            // 3. Perform the actual update
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

    async deleteAll() {
        // for testing only TODO delete this after dev
        return await OrderRepository.deleteAll();
    }

    // --- PAY FOR ME HELPERS ---

    async getOrderByPayForMeToken(token: string) {
        // Use Repository to find by token
        const order = await OrderRepository.findOrderByPayForMeToken(token);

        if (!order) throw new Error('Invalid payment link');

        // Check if pending
        if (order.payForMeStatus !== 'pending') {
            throw new Error(`This payment link is ${order.payForMeStatus}`);
        }

        // Check Expiry
        if (order.payForMeExpiresAt && order.payForMeExpiresAt < new Date()) {
            // Optionally update to expired if not already
            if (order.payForMeStatus === 'pending') {
                await OrderRepository.updateOrder(order._id as string, {
                    payForMeStatus: 'expired'
                });
            }
            throw new Error('Payment link has expired');
        }

        return order;
    }

    async completePayForMeOrder(
        orderId: string,
        payerId: string,
        paymentMethod: 'wallet' | 'online' = 'wallet'
    ): Promise<Order | any> {
        // 1. Fetch Order
        const order = await OrderRepository.findOrderById(orderId);
        if (!order) throw new Error('Order not found');

        // 2. Validate State
        if (order.payForMeStatus !== 'pending') {
            console.log(order.payForMeStatus);
            throw new Error('Order is not valid for Pay For Me completion');
        }
        if (order.paymentCompleted) {
            throw new Error('Order is already paid');
        }

        // 3. Process Payment based on Method

        if (paymentMethod === 'online') {
            // Fetch Payer Details
            const payer = await UserRepository.findUserById(payerId);
            if (!payer) throw new Error('Payer account not found');

            // Initiate Monnify Payment for this Payer
            // We need to ensure the webhook can identify this is a Pay For Me flow
            // The existing webhook checks "ORD-" reference.
            // If we use the SAME order reference, it will look like the original user paid.
            // But we want to record the Payer.
            // However, for MVP, as long as it is PAID, we update the order.
            // We just need to ensure the webhook updates `payForMePayer` as well?
            // Or we rely on the webhook detecting it's consistent.

            // Calling existing service
            return await PaymentService.initiateMonnifyPayment(order, payer);
        }

        // Default: Wallet Payment
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Check & Debit Payer's Wallet
            const debitResult = await WalletService.initDebitAccount(
                {
                    amount: order.totalAmount,
                    owner: payerId,
                    role: 'user'
                },
                session
            );

            if (!debitResult.success) {
                throw new Error(
                    'Insufficient wallet balance to pay for this order'
                );
            }

            // Move funds to System Escrow
            await WalletService.initCreditAccount(
                {
                    amount: order.totalAmount,
                    owner: 'system',
                    role: 'system'
                },
                session
            );

            // 4. Update Order
            const updatedOrder = await OrderRepository.updateOrder(
                orderId,
                {
                    payForMePayer: new mongoose.Types.ObjectId(payerId),
                    payForMeStatus: 'completed',
                    paymentCompleted: true,
                    status: 'pending', // Keep pending until vendor accepts
                    transactionReference: generateReference('TXN') // Generate a transaction ref
                },
                session
            );

            if (!updatedOrder) throw new Error('Failed to update order');

            await session.commitTransaction();
            return updatedOrder;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export default new OrderService();
