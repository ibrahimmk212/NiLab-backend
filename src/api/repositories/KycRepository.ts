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
            { new: true, runValidators: true }
        );
    }

    async updateBvnStatus(
        kycId: Types.ObjectId,
        bvnStatus: string,
        message?: string
    ): Promise<(Kyc & Document) | null> {
        return await KycModel.findByIdAndUpdate(
            kycId,
            { bvnStatus, message },
            { new: true, runValidators: true }
        );
    }

    async getKycByStatus(status?: string): Promise<(Kyc & Document)[]> {
        const query = status && status !== 'all' ? { status } : {};
        return await KycModel.find(query).populate('user').sort({ createdAt: -1 });
    }
}

export default new KycRepository();
