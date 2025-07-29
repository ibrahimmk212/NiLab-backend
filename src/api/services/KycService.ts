import KycRepository from '../repositories/KycRepository';
import { Types } from 'mongoose';
import { Kyc } from '../models/Kyc';

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
        status: string,
        message?: string
    ): Promise<Kyc | null> {
        return await KycRepository.updateKycStatus(kycId, status, message);
    }

    async getKycByStatus(status: string): Promise<Kyc[]> {
        return await KycRepository.getKycByStatus(status);
    }
}

export default new KycService();
