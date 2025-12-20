import RiderModel, { Rider } from '../models/Rider';
import users from '../routes/v1/users';

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

    async findAllRiders(options: any): Promise<any> {
        const page = parseInt(options.page as string, 10) || 1;
        const limit = parseInt(options.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            filter.$or = [
                { name: { $regex: options.search, $options: 'i' } },
                { email: { $regex: options.search, $options: 'i' } },
                { phoneNumber: { $regex: options.search, $options: 'i' } }
            ];
        }

        if (options.city) {
            filter.city = options.city;
        }

        if (options.vehicle) {
            filter.vehicle = options.vehicle;
        }

        if (options.available !== undefined) {
            filter.available = options.available === 'true';
        }

        if (options.sortBy) {
            options.sortBy = options.sortBy.replace(',', ' ');
        } else {
            options.sortBy = '-createdAt';
        }

        if (options.startDate && options.endDate) {
            filter.createdAt = {
                $gte: new Date(options.startDate),
                $lte: new Date(options.endDate)
            };
        }

        const [riders, total] = await Promise.all([
            RiderModel.find(filter)
                .sort(options.sortBy)
                .skip(skip)
                .limit(limit),
            RiderModel.countDocuments(filter)
        ]);

        return {
            total,
            count: riders.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: riders
        };
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
