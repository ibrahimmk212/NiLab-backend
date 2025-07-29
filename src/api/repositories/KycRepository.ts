import KycModel, { Kyc } from '../models/Kyc';
import { Document, Types } from 'mongoose';

class KycRepository {
    async createKyc(kycData: Partial<Kyc>): Promise<Kyc & Document> {
        return await KycModel.create(kycData);
    }

    async getKycByUser(
        userId: Types.ObjectId
    ): Promise<(Kyc & Document) | null> {
        return await KycModel.findOne({ user: userId }).populate('user');
    }

    async updateKyc(
        userId: Types.ObjectId,
        kycData: Partial<Kyc>
    ): Promise<(Kyc & Document) | null> {
        return await KycModel.findOneAndUpdate({ user: userId }, kycData, {
            new: true
        });
    }

    async getKycById(kycId: Types.ObjectId): Promise<(Kyc & Document) | null> {
        return await KycModel.findById(kycId).populate('user');
    }

    async updateKycStatus(
        kycId: Types.ObjectId,
        status: string,
        message?: string
    ): Promise<(Kyc & Document) | null> {
        return await KycModel.findByIdAndUpdate(
            kycId,
            { status, message },
            { new: true }
        );
    }

    async getKycByStatus(status: string): Promise<(Kyc & Document)[]> {
        return await KycModel.find({ status }).populate('user');
    }
}

export default new KycRepository();
