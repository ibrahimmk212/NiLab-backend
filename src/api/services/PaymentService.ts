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
    /**
     * Handles Monnify Webhook Notifications
     * Supports both Order payments (ORD-) and Wallet Top-ups (WAL-)
     */
    async handleMonnifyWebhook(payload: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const {
                transactionReference,
                paymentReference,
                amountPaid,
                paymentStatus
            } = payload;

            // 1. Idempotency Check: Prevent duplicate processing
            const exists = await PaymentRepository.findByTransactionReference(
                transactionReference
            );
            if (exists && exists.status === 'success') {
                await session.abortTransaction();
                return;
            }

            // 2. Map payload to Collection Model for audit trail
            const collectionData: Partial<Collection> = {
                transactionReference: transactionReference,
                paymentReference: paymentReference,
                amountPaid: amountPaid,
                paymentStatus: paymentStatus,
                status: paymentStatus === 'PAID' ? 'success' : 'failed',
                responseData: payload
            };

            // 3. Extract original reference (Remove timestamp suffix if it exists)
            // Example: "ORD-ABC-12345" becomes "ORD-ABC"
            let originalRef = paymentReference;
            if (paymentReference.includes('-')) {
                const parts = paymentReference.split('-');
                // Check if it follows the pattern ORD-XXXX or WAL-XXXX
                if (parts.length >= 2) {
                    originalRef = `${parts[0]}-${parts[1]}`;
                }
            }

            // 4. Processing Logic based on Reference Prefix
            if (paymentStatus === 'PAID') {
                if (originalRef.startsWith('ORD')) {
                    await this.processOrderPayment(
                        originalRef,
                        payload,
                        collectionData,
                        session
                    );
                } else if (originalRef.startsWith('WAL')) {
                    await this.processWalletTopUp(
                        originalRef,
                        payload,
                        collectionData,
                        session
                    );
                }
            }

            // 5. Save the collection record
            await PaymentRepository.createCollection(collectionData, session);

            await session.commitTransaction();
            console.log(`[PAYMENT_SUCCESS] Processed ${originalRef}`);
        } catch (error) {
            await session.abortTransaction();
            console.error('[PAYMENT_WEBHOOK_ERROR]:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Logic for processing Successful Orders
     */
    private async processOrderPayment(
        ref: string,
        payload: any,
        collectionData: any,
        session: any
    ) {
        const order = await OrderRepository.findOrderByPaymentReference(
            ref,
            session
        );
        if (order && !order.paymentCompleted) {
            // Mark Order as Paid
            await OrderRepository.updateOrder(
                order._id,
                { paymentCompleted: true }
                , // status: 'confirmed' }, // status update depends on your flow
                session
            );

            collectionData.orderId = order._id;
            collectionData.user = order.user;

            // Move money to System Escrow (Point Zero)
            const systemWallet = await WalletRepository.getWalletByOwner(
                'system',
                null,
                session
            );
            if (systemWallet) {
                await WalletRepository.creditPendingBalance(
                    systemWallet._id,
                    payload.amountPaid,
                    session
                );
            }
        }
    }

    /**
     * Logic for processing Wallet Top-ups
     */
    private async processWalletTopUp(
        ref: string,
        payload: any,
        collectionData: any,
        session: any
    ) {
        // Extract User ID or Wallet ID from metadata or reference
        // Assuming your WAL- refs are linked to a specific pending transaction or user
        // You would typically credit the user's available balance here

        // Example: If metadata contains userId
        const userId = payload.metaData?.userId;
        if (userId) {
            const userWallet = await WalletRepository.getWalletByOwner(
                'customer',
                userId,
                session
            );
            if (userWallet) {
                await WalletRepository.creditAvailableBalance(
                    userWallet._id,
                    payload.amountPaid,
                    session
                );
                collectionData.user = userId;
            }
        }
    }

    /**
     * Main Checkout Entry Point
     */
    async initiateCheckout(order: any, userdata: any) {
        if (!order) throw new Error('Order not found!');

        if (order.paymentType === 'wallet') {
            return await this.processWalletPayment(order, userdata);
        }

        return await this.initiateMonnifyPayment(order, userdata);
    }

    /**
     * Internal: Process payment using User's internal wallet balance
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

            // Debit User
            await WalletRepository.debitAvailableBalance(
                userWallet._id,
                order.totalAmount,
                session
            );

            // Credit System Escrow
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

            // Update Order
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
     * Internal: Generate Monnify Gateway Details
     */
    private async initiateMonnifyPayment(order: any, userdata: any) {
        const monnifyToken = await monnify.genToken();

        // Create unique reference for this specific attempt to avoid Monnify 422 errors
        const uniqueTransactionRef = `${order.paymentReference}-${Date.now()}`;

        const paymentRequest = await monnify.initiatePayment(
            {
                amount: order.totalAmount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Payment for Order ${order.code}`,
                paymentReference: uniqueTransactionRef,
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                redirectUrl: appConfig.monnify.redirectUrl,
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD'],
                // metadata helps in Webhook if string splitting fails
                metadata: {
                    orderId: order._id,
                    userId: userdata.id
                }
            },
            monnifyToken
        );

        if (!paymentRequest.requestSuccessful) {
            console.error('Monnify Rejection:', paymentRequest.responseMessage);
            throw new Error('Could not initialize payment with gateway');
        }

        return {
            valid: true,
            payment: {
                checkoutUrl: paymentRequest.responseBody.checkoutUrl,
                transactionReference:
                    paymentRequest.responseBody.transactionReference,
                paymentReference: order.paymentReference // Return the clean one to frontend
            }
        };
    }
}

export default new PaymentService();
