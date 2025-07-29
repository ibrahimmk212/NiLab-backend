import RiderRepository from '../repositories/RiderRepository';
import { Rider } from '../models/Rider';

interface IRiderService {
    createRider(payload: any): Promise<any>;
    getRiders(): Promise<any[]>;
    getRiderDetail(riderId: string): Promise<any>;
    updateRider(riderId: string, data: any): Promise<boolean>;
    deleteRider(riderId: string): Promise<boolean>;
}

class RiderService {
    async createRider(payload: any): Promise<any> {
        return RiderRepository.createRider({
            ...payload
        });
    }
    async findById(id: string) {
        const rider = await RiderRepository.findRiderById(id);
        if (!rider) {
            throw new Error('Rider not found');
        }
        return rider;
    }

    async getRiders(): Promise<Rider[] | null> {
        const riders = await RiderRepository.findRidersByOption({});

        return riders;
    }

    async getRiderDetail(riderId: string): Promise<Rider> {
        const rider = await RiderRepository.findRiderById(riderId);

        if (!rider) {
            throw new Error('Rider not found');
        }

        return rider;
    }

    async getRiderByUserId(userId: string): Promise<Rider> {
        const rider = await RiderRepository.findByKey('userId', userId);

        if (!rider) {
            throw new Error('Rider not found');
        }

        return rider;
    }

    async updateRider(riderId: string, payload: any): Promise<Rider | null> {
        const rider = await RiderRepository.findRiderById(riderId);

        if (!rider) {
            throw new Error('Rider not found');
        }

        return RiderRepository.updateRider(riderId, payload);
    }

    async updateRiderBank(
        riderId: string,
        payload: any
    ): Promise<Rider | null> {
        const rider = await RiderRepository.findRiderById(riderId);

        if (!rider) {
            throw new Error('Rider not found');
        }

        return RiderRepository.updateRider(riderId, {
            bankAccount: {
                accountNumber: payload.accountNumber,
                bankCode: payload.bankCode,
                accountName: payload.accountName,
                bankName: payload.bankName
            }
        });
    }
    // async deleteRider(riderId: string): Promise<Rider | null> {
    //     const rider = await RiderRepository.findRiderById(riderId);

    //     if (!rider) {
    //         throw new Error('Rider not found');
    //     }

    //     return RiderRepository.deleteRider(riderId);
    // }
}

export default new RiderService();
