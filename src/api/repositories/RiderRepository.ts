import RiderModel, { Rider } from '../models/Rider';

class RiderRepository {
    async createRider(data: Rider): Promise<Rider> {
        const rider = new RiderModel(data);
        return await rider.save();
    }

    async findRiderById(riderId: string): Promise<Rider | null> {
        return await RiderModel.findById(riderId).populate('userId');
    }

    async findByKey(key: string, value: string): Promise<Rider | null> {
        return await RiderModel.findOne({ [key]: value }).populate('userId');
    }
    // find Riders options
    async findRidersByOption(
        options: Record<string, unknown>
    ): Promise<Rider[] | null> {
        return await RiderModel.find(options)
            .populate('userId')
            .sort({ createdAt: -1 });
    }

    // find nearby Riders
    async findCityRiders(city: string): Promise<Rider[]> {
        return await RiderModel.find({
            city: city
        }).populate('userId');
    }

    async updateRider(
        riderId: string,
        updateData: Partial<Rider>
    ): Promise<Rider | null> {
        return await RiderModel.findByIdAndUpdate(riderId, updateData, {
            new: true
        }).populate('userId');
    }

    async deleteRider(riderId: string): Promise<Rider | null> {
        return await RiderModel.findByIdAndDelete(riderId, { new: true });
    }

    // Additional rider-specific methods...
}

export default new RiderRepository();
