/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { Payout } from '../models/Payout';
import PayoutRepository from '../repositories/PayoutRepository';
import PaymentService from './PaymentService';
import emails from '../libraries/emails';
import UserRepository from '../repositories/UserRepository';
import NotificationService from './NotificationService';
class PayoutService {
    async createPayout(
        userId: Types.ObjectId,
        kycData: Partial<Payout>
    ): Promise<Payout> {
        const kyc = await PayoutRepository.createPayout({
            ...kycData,
            userId: userId
        });
        return kyc;
    }

    async getPayoutByUser(userId: string): Promise<Payout | null> {
        return await PayoutRepository.findByKey('userId', userId);
    }

    async requestPayout(payload: {
        userId: string;
        amount: number;
        bankName: string;
        accountName: string;
        accountNumber: string;
        bankCode: string;
    }): Promise<any | null> {
        const payout = await PayoutRepository.requestPayout(
            payload.userId,
            payload.amount,
            payload.bankName,
            payload.accountNumber,
            payload.bankCode
        );

        // Send Email Notification
        const user = await UserRepository.findUserById(payload.userId);
        if (user) {
            emails.payoutRequest(user.email, {
                name: user.firstName,
                amount: payload.amount.toString(),
                accountNumber: payload.accountNumber,
                bankName: payload.bankName,
                requestDate: new Date().toDateString()
            });

            // User Notification
            await NotificationService.create({
                userId: user._id,
                title: 'Payout Request Submitted',
                message: `Your payout request for ${payload.amount} has been received.`,
                status: 'unread'
            });

            // Admin Notification
            await NotificationService.notifyAdmins(
                'New Payout Request',
                `User ${user.firstName} ${user.lastName} requested a payout of ${payload.amount}`
            );
        }

        return payout;
    }

    async completePayout(payoutId: string): Promise<any | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Get Payout to check validity
            const payout: any = await PayoutRepository.findById(payoutId);
            if (!payout) throw new Error('Payout not found');
            if (payout.status !== 'pending')
                throw new Error('Payout is not pending');

            // 2. Process Transfer (Monnify)
            // This is external, so if it fails we don't commit the DB transaction
            const transferResult = await PaymentService.processPayout(payout);

            if (!transferResult.success) {
                throw new Error(`${transferResult.message}`);
            }

            // 3. Finalize in DB (Update Wallet & Status)
            const finalized = await PayoutRepository.finalizePayout(
                payoutId,
                session
            );

            await session.commitTransaction();

            // Send Email Notification
            const user = await UserRepository.findUserById(payout.userId);
            if (user) {
                emails.payoutCompletion(user.email, {
                    name: user.firstName,
                    amount: payout.amount.toString(),
                    accountNumber: payout.accountNumber,
                    bankName: payout.bankName,
                    transactionReference: transferResult.data?.transactionReference || transferResult.data?.reference || 'N/A',
                    completionDate: new Date().toDateString()
                });

                // User Notification
                await NotificationService.create({
                    userId: user._id,
                    title: 'Payout Successful',
                    message: `Your payout of ${payout.amount} has been processed successfully.`,
                    status: 'unread'
                });
            }

            return finalized;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async rejectPayout(payoutId: string, reason: string): Promise<any | null> {
        return await PayoutRepository.rejectPayout(payoutId, reason);
    }

    async updatePayout(
        id: string,
        data: Partial<Payout>
    ): Promise<Payout | null> {
        return await PayoutRepository.update(id, data);
    }

    async getPayoutById(id: string): Promise<Payout | null> {
        return await PayoutRepository.findById(id);
    }

    async getAllPayouts(options: any): Promise<any> {
        return await PayoutRepository.findAllPayouts(options);
    }
}

export default new PayoutService();
