import VehicleTypeModel, { VehicleType } from '../models/VehicleType';

class VehicleTypeRepository {
    async createVehicleType(data: VehicleType): Promise<VehicleType> {
        if (!data.slug) {
            data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
        }
        const vehicleType = new VehicleTypeModel(data);
        return await vehicleType.save();
    }

    async findVehicleTypeById(
        vehicleTypeId: string
    ): Promise<VehicleType | null> {
        return await VehicleTypeModel.findById(vehicleTypeId);
    }

    async updateVehicleType(
        vehicleTypeId: string,
        updateData: Partial<VehicleType>
    ): Promise<VehicleType | null> {
        if (!updateData.slug && updateData.name) {
            updateData.slug = updateData.name
                .toLowerCase()
                .replace(/\s+/g, '-');
        }
        return await VehicleTypeModel.findByIdAndUpdate(
            vehicleTypeId,
            updateData,
            {
                new: true
            }
        );
    }

    async deleteVehicleType(
        vehicleTypeId: string
    ): Promise<VehicleType | null> {
        return await VehicleTypeModel.findByIdAndDelete(vehicleTypeId, {
            new: true
        });
    }

    async findAllVehicleTypes(options: any): Promise<any> {
        const page = parseInt(options.page as string, 10) || 1;
        const limit = parseInt(options.limit as string, 10) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (options.search) {
            filter.name = { $regex: options.search, $options: 'i' };
        }

        const sort: any = {};
        if (options.sortBy) {
            sort[options.sortBy as string] =
                options.sortOrder === 'asc' ? 1 : -1;
        } else {
            sort.createdAt = -1;
        }

        const [vehicleTypes, total] = await Promise.all([
            VehicleTypeModel.find(filter).sort(sort).skip(skip).limit(limit),
            VehicleTypeModel.countDocuments(filter)
        ]);

        return {
            total,
            count: vehicleTypes.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: vehicleTypes
        };
    }
}

export default new VehicleTypeRepository();
