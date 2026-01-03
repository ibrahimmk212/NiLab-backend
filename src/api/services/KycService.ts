/* eslint-disable @typescript-eslint/no-explicit-any */
import KycRepository from '../repositories/KycRepository';
import { Types } from 'mongoose';
import { Kyc } from '../models/Kyc';
import UserRepository from '../repositories/UserRepository';

class KycService {
    async createKyc(
        userId: Types.ObjectId,
        kycData: Partial<Kyc>
    ): Promise<Kyc> {
        const kyc = await KycRepository.createKyc({
            ...kycData,
            user: userId,
            role: 'rider'
        });
        await UserRepository.updateUser(`${userId}`, {
            kycStatus: 'pending'
        });
        return kyc;
    }

    async getKyc(userId: Types.ObjectId): Promise<Kyc | null> {
        return await KycRepository.getKycByUser(userId);
    }

    async updateKyc(
        userId: Types.ObjectId,
        kycData: Partial<Kyc>
    ): Promise<Kyc | null> {
        return await KycRepository.updateKyc(userId, kycData);
    }

    async getKycById(kycId: Types.ObjectId): Promise<Kyc | null> {
        return await KycRepository.getKycById(kycId);
    }

    async updateKycStatus(
        kycId: Types.ObjectId,
        status: 'pending' | 'not_submitted' | 'approved' | 'rejected',
        message?: string
    ): Promise<Kyc | null> {
        const kyc: any = await KycRepository.getKycById(kycId);
        if (!kyc) throw new Error('KYC not found!');
        // update kycstatus on user record
        await UserRepository.updateUser(kyc.user.id, {
            kycStatus: status
        });
        return await KycRepository.updateKycStatus(kycId, status, message);
    }

    async getKycByStatus(status: string): Promise<Kyc[]> {
        return await KycRepository.getKycByStatus(status);
    }
}

export default new KycService();
