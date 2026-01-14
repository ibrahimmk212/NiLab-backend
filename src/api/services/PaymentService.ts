// services/PaymentService.ts
import PaymentRepository from '../repositories/PaymentRepository';
import WalletRepository from '../repositories/WalletRepository';
import OrderRepository from '../repositories/OrderRepository';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { generateReference } from '../../utils/keygen/idGenerator';
import monnify from '../libraries/monnify';
import appConfig from '../../config/appConfig';

class PaymentService {
    async handleMonnifyWebhook(payload: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Check if we already handled this MNFY ref
            const exists = await PaymentRepository.findByTransactionReference(
                payload.transactionReference
            );
            if (exists && exists.status === 'success') return;

            // 2. Map payload to our Collection Model
            const collectionData: Partial<Collection> = {
                transactionReference: payload.transactionReference,
                paymentReference: payload.paymentReference,
                amountPaid: payload.amountPaid,
                paymentStatus: payload.paymentStatus,
                status: payload.paymentStatus === 'PAID' ? 'success' : 'failed',
                responseData: payload
                // ... map other fields from your model
            };

            // 3. Logic Branch: Is this an Order or a Wallet Top-up?
            if (payload.paymentReference.startsWith('ORD')) {
                const order = await OrderRepository.findOrderByPaymentReference(
                    payload.paymentReference,
                    session
                );
                if (order) {
                    await OrderRepository.updateOrder(
                        order._id,
                        { paymentCompleted: true },
                        session
                    );
                    collectionData.orderId = order._id as any;
                    collectionData.user = order.user as any;

                    // Trigger Escrow (Point Zero)
                    const systemWallet =
                        await WalletRepository.getWalletByOwner(
                            'system',
                            null,
                            session
                        );
                    await WalletRepository.creditPendingBalance(
                        systemWallet!._id,
                        payload.amountPaid,
                        session
                    );
                }
            } else if (payload.paymentReference.startsWith('WAL')) {
                // Logic for Wallet Top-up
            }

            await PaymentRepository.createCollection(collectionData, session);
            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async processSuccessfulTransaction(eventData: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { paymentReference, transactionReference, amountPaid } =
                eventData;

            // 1. Idempotency Check (Don't process same payment twice)
            const existingPayment =
                await PaymentRepository.findByTransactionReference(
                    transactionReference
                );
            if (existingPayment && existingPayment.status === 'success') {
                return;
            }

            // 2. Identify the target (Order or Wallet Top-up)
            if (paymentReference.startsWith('ORD')) {
                const order = await OrderRepository.findOrderByPaymentReference(
                    paymentReference,
                    session
                );

                if (order && !order.paymentCompleted) {
                    // A) Mark Order as Paid
                    await OrderRepository.updateOrder(
                        order._id,
                        {
                            paymentCompleted: true,
                            transactionReference
                        },
                        session
                    );

                    // B) Move Money to Platform Escrow (Point Zero)
                    const systemWallet =
                        await WalletRepository.getWalletByOwner(
                            'system',
                            null,
                            session
                        );
                    await WalletRepository.creditPendingBalance(
                        systemWallet!._id,
                        amountPaid,
                        session
                    );

                    // C) Record the Collection audit trail
                    await PaymentRepository.createCollection(
                        {
                            user: order.user as any,
                            orderId: order._id as any,
                            amountPaid,
                            paymentReference,
                            transactionReference,
                            status: 'success',
                            paymentMethod: eventData.paymentMethod,
                            responseData: eventData
                        },
                        session
                    );
                }
            }
            // Logic for Wallet Top-ups (WAL-) can go here...

            await session.commitTransaction();
        } catch (error) {
            await session.abortTransaction();
            console.error('[PAYMENT_ERROR] Webhook processing failed:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async initiateCheckout(order: any, userdata: any) {
        if (!order) throw new Error('Order not found!');

        // 1. Handle Wallet Payment
        if (order.paymentType === 'wallet') {
            return await this.processWalletPayment(order, userdata);
        }

        // 2. Handle Online Payment (Monnify)
        return await this.initiateMonnifyPayment(order, userdata);
    }

    /**
     * Internal: Process payment using User's internal wallet
     */
    private async processWalletPayment(order: any, userdata: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const userWallet = await WalletRepository.getWalletByOwner(
                userdata.role,
                userdata.id,
                session
            );

            if (
                !userWallet ||
                userWallet.availableBalance < order.totalAmount
            ) {
                throw new Error('Insufficient wallet balance.');
            }

            // Debit User, Credit System Escrow (Point Zero)
            await WalletRepository.debitAvailableBalance(
                userWallet._id,
                order.totalAmount,
                session
            );

            const systemWallet = await WalletRepository.getWalletByOwner(
                'system',
                null,
                session
            );
            await WalletRepository.creditPendingBalance(
                systemWallet!._id,
                order.totalAmount,
                session
            );

            // Mark Order as Paid
            await OrderRepository.updateOrder(
                order._id,
                {
                    paymentCompleted: true,
                    transactionReference: generateReference('TXN')
                },
                session
            );

            await session.commitTransaction();
            return { valid: true, message: 'Payment successful via wallet.' };
        } catch (error: any) {
            await session.abortTransaction();
            return { valid: false, message: error.message };
        } finally {
            session.endSession();
        }
    }

    /**
     * Internal: Get Monnify Checkout URL/Details
     */
    private async initiateMonnifyPayment(order: any, userdata: any) {
        const monnifyToken = await monnify.genToken();

        // Use the ORD- reference we generated during order creation
        const reference = order.paymentReference;

        const paymentRequest = await monnify.initiatePayment(
            {
                amount: order.totalAmount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Payment for Order ${order.code}`,
                paymentReference: reference,
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                redirectUrl: appConfig.monnify.redirectUrl,
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
            },
            monnifyToken
        );

        if (!paymentRequest.requestSuccessful) {
            throw new Error('Could not initialize payment with gateway');
        }

        return {
            valid: true,
            payment: {
                checkoutUrl: paymentRequest.responseBody.checkoutUrl,
                transactionReference:
                    paymentRequest.responseBody.transactionReference,
                paymentReference: reference
            }
        };
    }
}

export default new PaymentService();
