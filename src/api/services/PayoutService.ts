/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import { Payout } from '../models/Payout';
import PayoutRepository from '../repositories/PayoutRepository';
import PaymentService from './PaymentService';

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
    }): Promise<any | null> {
        return await PayoutRepository.requestPayout(
            payload.userId,
            payload.amount,
            payload.bankName,
            payload.accountNumber,
            payload.accountName
        );
    }

    async completePayout(payoutId: string): Promise<any | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Get Payout to check validity
            const payout = await PayoutRepository.findById(payoutId);
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
