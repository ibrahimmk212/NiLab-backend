/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import PaymentRepository from '../../repositories/PaymentRepository';
import WalletRepository from '../../repositories/WalletRepository';
import OrderRepository from '../../repositories/OrderRepository';
import Monnify from '../../libraries/monnify';
import { Collection } from '../../models/Collection';

class PaymentService {
    /**
     * Entry point for Webhooks
     */
    async handleMonnifyWebhook(payload: any) {
        if (payload.eventType === 'SUCCESSFUL_TRANSACTION') {
            return await this.processSuccessfulTransaction(payload.eventData);
        }
    }

    /**
     * Entry point for Manual Verification (from Frontend "I have paid" button)
     */
    async verifyAndCompletePayment(transactionReference: string) {
        try {
            const monnifyToken = await Monnify.genToken();

            // This now calls the method we just added
            const transactionData = await Monnify.getTransactionStatus(
                transactionReference,
                monnifyToken
            );

            // Monnify status for a successful payment is usually 'PAID' or 'OVERPAID'
            if (
                transactionData &&
                (transactionData.paymentStatus === 'PAID' ||
                    transactionData.paymentStatus === 'OVERPAID')
            ) {
                // We reuse our Point Zero logic to settle the order/wallet
                return await this.processSuccessfulTransaction(transactionData);
            }

            return {
                valid: false,
                message: `Transaction is currently: ${
                    transactionData?.paymentStatus || 'NOT FOUND'
                }`
            };
        } catch (error) {
            console.error('Manual verification failed:', error);
            throw error;
        }
    }

    /**
     * CORE LOGIC: processSuccessfulTransaction
     */
    async processSuccessfulTransaction(eventData: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { paymentReference, transactionReference, amountPaid } =
                eventData;

            // 1. Idempotency Check
            const existing = await PaymentRepository.findByTransactionReference(
                transactionReference
            );
            if (existing && existing.status === 'success') {
                await session.abortTransaction();
                return existing;
            }

            const collectionData: Partial<Collection> = {
                transactionReference,
                paymentReference,
                amountPaid,
                status: 'success',
                responseData: eventData,
                internalReference: paymentReference
            };

            // BRANCH A: ORDER PAYMENT (Escrow Logic)
            if (paymentReference.startsWith('ORD')) {
                const order = await OrderRepository.findOrderByPaymentReference(
                    paymentReference,
                    session
                );
                if (order && !order.paymentCompleted) {
                    await OrderRepository.updateOrder(
                        order._id,
                        {
                            paymentCompleted: true,
                            transactionReference
                            // status: 'confirmed'
                        },
                        session
                    );

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

                    collectionData.orderId = order._id as any;
                    collectionData.user = order.user as any;
                }
            }

            // BRANCH B: WALLET TOP-UP (Direct Credit Logic)
            else if (paymentReference.startsWith('WAL')) {
                // For wallet top-ups, we find the user's wallet and add to AVAILABLE balance immediately
                // Assuming WAL- references are structured like WAL-USERID-TIMESTAMP
                const userId = paymentReference.split('-')[1];
                const userWallet = await WalletRepository.getWalletByOwner(
                    'user',
                    userId,
                    session
                );

                if (userWallet) {
                    await WalletRepository.creditAvailableBalance(
                        userWallet._id,
                        amountPaid,
                        session
                    );
                    collectionData.walletId = userWallet._id as any;
                    collectionData.user = userWallet.owner as any;
                }
            }

            const collection = await PaymentRepository.createCollection(
                collectionData,
                session
            );
            await session.commitTransaction();
            return collection;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

export default new PaymentService();
