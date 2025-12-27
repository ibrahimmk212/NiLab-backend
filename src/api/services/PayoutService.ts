/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Payout } from '../models/Payout';
import PayoutRepository from '../repositories/PayoutRepository';

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
        return await PayoutRepository.completePayout(payoutId);
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
