import RiderModel, { Rider } from '../models/Rider';

class RiderRepository {
    async createRider(data: Rider): Promise<Rider> {
        const rider = new RiderModel(data);
        return await rider.save();
    }

    async findRiderById(riderId: string): Promise<Rider | null> {
        return await RiderModel.findById(riderId);
    }

    async updateRider(
        riderId: string,
        updateData: Partial<Rider>
    ): Promise<Rider | null> {
        return await RiderModel.findByIdAndUpdate(riderId, updateData, {
            new: true
        });
    }

    async deleteRider(riderId: string): Promise<Rider | null> {
        return await RiderModel.findByIdAndDelete(riderId, { new: true });
    }

    // Additional rider-specific methods...
}

export default new RiderRepository();
