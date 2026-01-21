// services/PaymentService.ts
import PaymentRepository from '../repositories/PaymentRepository';
import WalletRepository from '../repositories/WalletRepository';
import OrderRepository from '../repositories/OrderRepository';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { generateReference } from '../../utils/keygen/idGenerator';
import monnify from '../libraries/monnify';
import appConfig from '../../config/appConfig';
import CollectionRepository from '../repositories/CollectionRepository';
import TransactionRepository from '../repositories/TransactionRepository';
import PayoutRepository from '../repositories/PayoutRepository';
import WalletModel from '../models/Wallet';
import TransactionModel from '../models/Transaction';
import PayoutModel from '../models/Payout';

class PaymentService {
    async handleMonnifyWebhook(payload: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const {
                transactionReference,
                paymentReference,
                amountPaid,
                paymentStatus,
                settlementAmount,
                paymentMethod,
                customer,
                metaData
            } = payload;

            // 1. Idempotency Check
            const exists = await PaymentRepository.findByTransactionReference(
                transactionReference
            );

            if (exists && exists.status === 'success') {
                await session.abortTransaction();
                return {
                    message: 'Payment already processed',
                    collection: exists
                };
            }

            // 2. Comprehensive Mapping (Keeping all fields)
            const collectionData: Partial<Collection> = {
                transactionReference,
                paymentReference,
                internalReference: generateReference('COL'),
                amountPaid,
                settlementAmount, // Added
                paymentMethod, // Added
                paymentStatus,
                customer: customer,
                status: paymentStatus === 'PAID' ? 'success' : 'failed',
                responseData: payload // This keeps everything else (product, bank info, etc)
            };

            // 3. Extract original reference
            let originalRef = paymentReference;
            if (paymentReference.includes('-')) {
                const parts = paymentReference.split('-');
                if (parts.length >= 2) {
                    originalRef = `${parts[0]}-${parts[1]}`;
                }
            }

            // 4. Processing Logic (Fixed Variable Scoping)
            let processedEntity = null;

            if (paymentStatus === 'PAID') {
                if (originalRef.startsWith('ORD')) {
                    // Remove 'const' so it updates the variable in the outer scope
                    processedEntity = await this.processOrderPayment(
                        originalRef,
                        payload,
                        collectionData,
                        session
                    );
                } else if (originalRef.startsWith('WAL')) {
                    processedEntity = await this.processWalletTopUp(
                        originalRef,
                        payload,
                        collectionData,
                        session
                    );
                }
            }

            // 5. Save the collection record
            const collection = await CollectionRepository.createCollection(
                collectionData,
                session
            );

            await session.commitTransaction();

            console.log(`[PAYMENT_SUCCESS] Processed ${originalRef}`, {
                collectionId: collection._id,
                entityStatus: processedEntity ? 'Updated' : 'Not Found'
            });
        } catch (error) {
            await session.abortTransaction();
            console.error('[PAYMENT_WEBHOOK_ERROR]:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async handleMonnifyDisbursementWebhook(eventData: any) {
        const { reference, status, amount, responseDescription } = eventData;

        // The reference we sent earlier was: `PAYOUT-${payout._id}-${Date.now()}`
        const payoutId = reference.split('-')[1];
        const payout = await PayoutRepository.findById(payoutId);

        if (!payout) return; // Or log for investigation

        // if payout is pending
        // If it's already completed, don't process again (Idempotency)
        if (payout.status === 'completed') return;

        if (status === 'SUCCESS') {
            await PayoutRepository.update(payout._id, { status: 'completed' });
        } else if (status === 'FAILED' || status === 'REVERSED') {
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // 1. Return money to "Available Balance"
                await WalletModel.findOneAndUpdate(
                    { _id: payout.walletId },
                    { $inc: { availableBalance: payout.amount } },
                    { session }
                );

                // 2. Mark payout as rejected
                await PayoutModel.findByIdAndUpdate(
                    payout._id,
                    {
                        status: 'rejected',
                        rejectionReason:
                            responseDescription || 'Bank Transfer Failed'
                    },
                    { session }
                );

                // 3. Log the Reversal Transaction
                await TransactionRepository.createTransaction(
                    {
                        userId: payout.userId,
                        amount: payout.amount,
                        type: 'CREDIT',
                        category: 'REVERSAL',
                        remark: `Refund: ${responseDescription}`,
                        reference: `REV-${reference}`
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
    }

    /**
     * Updated to return the order for the console log
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
            const updatedOrder = await OrderRepository.updateOrder(
                order._id,
                { paymentCompleted: true },
                session
            );

            collectionData.orderId = order._id;
            collectionData.user = order.user;

            const systemWallet = await WalletRepository.getWalletByOwner(
                'system',
                null,
                session
            );

            console.log('system Wallet: ', systemWallet);
            if (systemWallet) {
                await WalletRepository.creditPendingBalance(
                    systemWallet._id,
                    payload.amountPaid,
                    session
                );
            }
            console.log('Updated Order');
            return updatedOrder;
        }
        console.log('Returned Order');

        return order;
    }

    /**
     * Logic for processing Wallet Top-ups
     */
    // Inside processWalletTopUp
    private async processWalletTopUp(
        ref: string,
        payload: any,
        collectionData: any,
        session: any
    ) {
        const userId = payload.metaData?.userId;
        const amount = payload.amountPaid;

        if (userId) {
            const userWallet = await WalletRepository.getWalletByOwner(
                'user',
                userId,
                session
            );

            if (userWallet) {
                const balanceBefore = userWallet.availableBalance;

                // 1. Update the Wallet
                await WalletRepository.creditAvailableBalance(
                    userWallet._id,
                    amount,
                    session
                );

                // 2. Create the Ledger Entry (Transaction)
                await TransactionRepository.createTransaction(
                    {
                        userId: userId,
                        role: 'user',
                        amount: amount,
                        type: 'CREDIT',
                        category: 'TOPUP', // Or add 'TOPUP' to your enum
                        status: 'successful',
                        reference: ref,
                        toWallet: userWallet._id,
                        balanceBefore: balanceBefore,
                        balanceAfter: balanceBefore + amount,
                        remark: 'Wallet funding via Monnify'
                    },
                    session
                );

                collectionData.user = userId;
                return userWallet;
            }
        }
        return null;
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
                metaData: {
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

    /**
     * External: Initiate a Wallet Top-up (Funding)
     */
    async initiateWalletTopup(amount: number, userdata: any) {
        if (!amount || amount <= 0) throw new Error('Invalid top-up amount');

        const monnifyToken = await monnify.genToken();

        // Generate a unique WAL reference
        // Format: WAL-USERID-TIMESTAMP
        const walletRef = `WAL-${userdata.id}-${Date.now()}`;

        const paymentRequest = await monnify.initiatePayment(
            {
                amount: amount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Wallet Top-up for ${userdata.firstName}`,
                paymentReference: walletRef,
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                redirectUrl: appConfig.monnify.redirectUrl,
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD'],
                metaData: {
                    userId: userdata.id,
                    userRole: userdata.role,
                    type: 'wallet_topup'
                }
            },
            monnifyToken
        );

        if (!paymentRequest.requestSuccessful) {
            console.error(
                'Monnify Top-up Rejection:',
                paymentRequest.responseMessage
            );
            throw new Error('Could not initialize wallet top-up');
        }

        return {
            valid: true,
            payment: {
                checkoutUrl: paymentRequest.responseBody.checkoutUrl,
                transactionReference:
                    paymentRequest.responseBody.transactionReference,
                paymentReference: walletRef
            }
        };
    }
}

export default new PaymentService();
