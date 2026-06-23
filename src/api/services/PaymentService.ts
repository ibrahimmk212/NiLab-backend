// services/PaymentService.ts
import PaymentRepository from '../repositories/PaymentRepository';
import WalletRepository from '../repositories/WalletRepository';
import OrderRepository from '../repositories/OrderRepository';
import mongoose from 'mongoose';
import { Collection } from '../models/Collection';
import { generateReference } from '../../utils/keygen/idGenerator';
import paystack from '../libraries/paystack';
import appConfig from '../../config/appConfig';
import CollectionRepository from '../repositories/CollectionRepository';
import TransactionRepository from '../repositories/TransactionRepository';
import PayoutRepository from '../repositories/PayoutRepository';
import WalletModel from '../models/Wallet';
import TransactionModel from '../models/Transaction';
import PayoutModel, { Payout } from '../models/Payout';
import NotificationService from './NotificationService';
import { sendPushNotification } from '../libraries/firebase';

class PaymentService {
    async handlePaystackWebhook(payload: any) {
        if (payload.event !== 'charge.success') {
            return;
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        console.log('Webhook Payload:', payload);

        try {
            const data = payload.data;
            const transactionReference = data.reference;
            const paymentReference = data.reference;
            const amountPaid = data.amount / 100;
            const settlementAmount = (data.amount - (data.fees || 0)) / 100;
            const paymentMethod = data.channel;
            const customer = {
                email: data.customer.email,
                name: `${data.customer.first_name || ''} ${data.customer.last_name || ''}`.trim()
            };
            const metaData = data.metadata || {};

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

            // 2. Comprehensive Mapping
            const collectionData: Partial<Collection> = {
                transactionReference,
                paymentReference,
                internalReference: generateReference('COL'),
                amountPaid,
                settlementAmount,
                paymentMethod,
                paymentStatus: 'PAID',
                customer: customer,
                status: 'success',
                responseData: payload
            };

            // 3. Extract original reference
            let originalRef = paymentReference;
            if (paymentReference.includes('-')) {
                const parts = paymentReference.split('-');
                if (parts.length >= 2) {
                    originalRef = `${parts[0]}-${parts[1]}`;
                }
            }

            // 4. Processing Logic
            let processedEntity = null;

            if (originalRef.startsWith('ORD')) {
                processedEntity = await this.processOrderPayment(
                    originalRef,
                    { transactionReference, amountPaid },
                    collectionData,
                    session
                );
            } else if (originalRef.startsWith('WAL') || data.channel === 'dedicated_account') {
                processedEntity = await this.processWalletTopUp(
                    originalRef,
                    { ...data, amountPaid, metaData },
                    collectionData,
                    session
                );
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

            // Trigger notifications for product orders
            if (processedEntity && originalRef.startsWith('ORD')) {
                const OrderService = require('./OrderService').default;
                OrderService.triggerOrderNotifications(processedEntity._id.toString()).catch(console.error);
            }
        } catch (error) {
            await session.abortTransaction();
            console.error('[PAYMENT_WEBHOOK_ERROR]:', error);
            throw error;
        } finally {
            session.endSession();
        }
    }

    async handlePaystackDisbursementWebhook(payload: any) {
        const event = payload.event;
        const data = payload.data;
        const { reference } = data;

        if (!reference) return;

        // The reference we sent earlier was: `PAYOUT-${payout._id}-${Date.now()}`
        const parts = reference.split('-');
        if (parts.length < 2) return;
        const payoutId = parts[1];

        const payout = await PayoutRepository.findById(payoutId);
        if (!payout) return;

        if (payout.status === 'completed') return;

        if (event === 'transfer.success') {
            await PayoutRepository.update(payout._id, { status: 'completed' });
        } else if (event === 'transfer.failed' || event === 'transfer.reversed') {
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
                const reason = data.failures?.message || 'Paystack Bank Transfer Failed';
                await PayoutModel.findByIdAndUpdate(
                    payout._id,
                    {
                        status: 'rejected',
                        rejectionReason: reason
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
                        remark: `Refund: ${reason}`,
                        reference: `REV-${reference}`
                    },
                    session
                );

                // 4. Notify User
                try {
                    await NotificationService.create({
                        userId: payout.userId,
                        title: 'Payout Failed',
                        message: `Your payout of ₦${payout.amount} failed and has been reversed to your wallet. Reason: ${reason}`,
                        status: 'unread'
                    });
                } catch (err) {
                    console.error('Payout Reversal Notification Error:', err);
                }

                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        }
    }

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
                {
                    paymentCompleted: true,
                    transactionReference: payload.transactionReference
                },
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

    private async processWalletTopUp(
        ref: string,
        payload: any,
        collectionData: any,
        session: any
    ) {
        let userId = payload.metaData?.userId;

        // If it's a dedicated account transfer, find user wallet by Paystack customer code
        if (!userId) {
            const customerCode = payload.customer?.customer_code;
            const customerEmail = payload.customer?.email;
            
            let wallet = null;
            if (customerCode) {
                wallet = await WalletModel.findOne({ 'virtualAccount.accountReference': customerCode }).session(session);
            }
            if (!wallet && customerEmail) {
                const UserRepository = (await import('../repositories/UserRepository')).default;
                const userObj = await UserRepository.findUserByEmail(customerEmail);
                if (userObj) {
                    wallet = await WalletRepository.getWalletByOwner('user', userObj._id.toString(), session);
                }
            }

            if (wallet) {
                userId = wallet.owner?.toString();
            }
        }

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
                        category: 'TOPUP',
                        status: 'successful',
                        reference: ref,
                        toWallet: userWallet._id,
                        balanceBefore: balanceBefore,
                        balanceAfter: balanceBefore + amount,
                        remark: 'Wallet funding via Paystack'
                    },
                    session
                );

                // Send Push Notification
                try {
                    await NotificationService.create({
                        userId: userId,
                        title: 'Wallet Funded',
                        message: `Your wallet has been successfully funded with ₦${amount}`,
                        status: 'unread'
                    });
                } catch (err) {
                    console.error('Wallet Notification Error:', err);
                }

                collectionData.user = userId;
                return userWallet;
            }
        }
        return null;
    }

    async initiateCheckout(order: any, userdata: any) {
        if (!order) throw new Error('Order not found!');

        if (order.paymentType === 'wallet') {
            return await this.processWalletPayment(order, userdata);
        }

        if (order.paymentType === 'cash') {
            const OrderService = require('./OrderService').default;
            OrderService.triggerOrderNotifications(order._id.toString()).catch(console.error);
            return { valid: true, message: 'Pay on delivery initiated' };
        }

        if (order.paymentType === 'pay-for-me') {
            return {
                valid: true,
                payment: {
                    payForMeToken: order.payForMeToken,
                    expiresAt: order.payForMeExpiresAt,
                    shareableLink: order.payForMeToken
                }
            };
        }

        return await this.initiatePaystackPayment(order, userdata);
    }

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
                isNaN(order.totalAmount) ||
                order.totalAmount <= 0 ||
                userWallet.availableBalance < order.totalAmount
            ) {
                console.log('Insufficient wallet balance.');
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

            const OrderService = require('./OrderService').default;
            OrderService.triggerOrderNotifications(order._id.toString()).catch(console.error);

            return { valid: true, message: 'Payment successful via wallet.' };
        } catch (error: any) {
            await session.abortTransaction();
            return { valid: false, message: error.message };
        } finally {
            session.endSession();
        }
    }

    async initiatePaystackPayment(order: any, userdata: any) {
        const uniqueTransactionRef = `${order.paymentReference}-${Date.now()}`;

        const response = await paystack.initiatePayment(
            order.totalAmount,
            userdata.email,
            uniqueTransactionRef,
            undefined,
            {
                orderId: order._id,
                userId: userdata.id
            }
        );

        if (!response.status || !response.data) {
            console.error('Paystack Rejection:', response.message);
            throw new Error('Could not initialize payment with gateway');
        }
        console.log('Payment Request: ', response);

        return {
            valid: true,
            payment: {
                merchantName: 'Terminus Drive Payment',
                checkoutUrl: response.data.authorization_url,
                transactionReference: response.data.reference,
                paymentReference: order.paymentReference
            }
        };
    }

    async initiateWalletTopup(amount: number, userdata: any) {
        if (!amount || amount <= 0) throw new Error('Invalid top-up amount');

        const walletRef = `WAL-${userdata.id}-${Date.now()}`;

        const response = await paystack.initiatePayment(
            amount,
            userdata.email,
            walletRef,
            undefined,
            {
                userId: userdata.id,
                userRole: userdata.role,
                type: 'wallet_topup'
            }
        );

        if (!response.status || !response.data) {
            console.error(
                'Paystack Top-up Rejection:',
                response.message
            );
            throw new Error('Could not initialize wallet top-up');
        }

        return {
            valid: true,
            payment: {
                checkoutUrl: response.data.authorization_url,
                transactionReference: response.data.reference,
                paymentReference: walletRef
            }
        };
    }

    async processPayout(payout: Payout) {
        const reference = `PAYOUT-${payout._id}-${Date.now()}`;

        try {
            const recipientRes = await paystack.createTransferRecipient(
                payout.accountNumber,
                payout.bankCode!,
                payout.accountName
            );

            if (!recipientRes.status || !recipientRes.data?.recipient_code) {
                console.error('Paystack Transfer Recipient Creation Failed:', recipientRes);
                return {
                    success: false,
                    message: recipientRes.message || 'Failed to create transfer recipient'
                };
            }

            const recipientCode = recipientRes.data.recipient_code;

            const transferRes = await paystack.initiateTransfer(
                payout.amount,
                recipientCode,
                reference,
                `Terminus Payout - ${new Date().toLocaleDateString('en-GB')}`
            );

            if (!transferRes.status || !transferRes.data) {
                console.error('Paystack Payout Failed:', transferRes);
                return {
                    success: false,
                    message: transferRes.message || 'Transfer initiation failed'
                };
            }

            console.log('Payout Initiated:', transferRes);

            return {
                success: true,
                message: 'Transfer initiated successfully',
                data: transferRes.data
            };
        } catch (error: any) {
            console.error('Payout Error:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || error.message || 'An error occurred during payout'
            };
        }
    }
}

export default new PaymentService();
