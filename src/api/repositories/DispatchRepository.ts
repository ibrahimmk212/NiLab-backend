import mongoose from 'mongoose';
import DeliveryModel from '../models/Delivery';
import DispatchModel, { Dispatch } from '../models/Dispatch';

class DispatchRepository {
    async createDispatch(
        dispatchData: Partial<Dispatch>,
        session?: mongoose.ClientSession
    ): Promise<Dispatch> {
        const dispatch = new DispatchModel(dispatchData);
        return await dispatch.save({ session });
    }

    async getAll(options: any): Promise<any> {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        // Add support for new reference searches
        if (options.status) filter.status = options.status;
        if (options.riderId) filter.rider = options.riderId;
        if (options.search) {
            const searchRegex = new RegExp(options.search, 'i');

            filter.$or = [
                { 'order.code': searchRegex },
                { 'order.paymentReference': searchRegex },
                { 'rider.firstName': searchRegex },
                { 'rider.lastName': searchRegex },
                { 'dispatch.deliveryCode': searchRegex }
            ];
        }
        if (options.pickupState) filter['pickup.state'] = options.pickupState;
        // if (options.pickupCity) filter['pickup.city'] = options.pickupCity;

        if (options.sortBy) {
            filter.sort = {};
            filter.sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
        }

        if (options.orderType) filter.orderType = options.orderType;

        const [dispatches, total] = await Promise.all([
            DispatchModel.find(filter)
                .populate({
                    path: 'deliveries',
                    populate: {
                        path: 'order rider dispatch',
                        populate: {
                            path: 'vendor'
                        }
                    }
                })
                .skip(skip)
                .limit(limit),
            DispatchModel.countDocuments(filter)
        ]);

        return {
            total,
            count: dispatches.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: dispatches
        };
    }

    async updateDispatch(
        dispatchId: string,
        updateData: Partial<Dispatch>,
        session?: mongoose.ClientSession
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(dispatchId, updateData, {
            new: true,
            session
        });
    }

    async addDeliveriesToDispatch(
        dispatchId: string,
        deliveryIds: string[],
        session?: mongoose.ClientSession // Added session
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(
            dispatchId,
            { $addToSet: { deliveries: { $each: deliveryIds } } },
            { new: true, session } // Passed session
        );
    }

    async removeDelivery(
        dispatchId: string,
        deliveryId: string,
        session?: mongoose.ClientSession // Added session
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(
            dispatchId,
            { $pull: { deliveries: deliveryId } },
            { new: true, session } // Passed session
        );
    }
    async getDispatchById(dispatchId: string): Promise<Dispatch | null> {
        return await DispatchModel.findById(dispatchId).populate('deliveries');
    }

    async getDispatchesForRider(riderId: string): Promise<Dispatch[]> {
        return await DispatchModel.find({ riderId }).populate('deliveries');
    }

    async getActiveDispatch(
        riderId: string,
        session?: mongoose.ClientSession
    ): Promise<Dispatch | null> {
        return await DispatchModel.findOne({
            rider: riderId,
            status: { $in: ['created', 'in-progress'] }
        })
            .session(session || null) // Optional read-locking
            .populate('deliveries');
    }
    async countUnfinishedInDispatch(dispatchId: string): Promise<number> {
        return await DeliveryModel.countDocuments({
            dispatch: dispatchId,
            status: { $ne: 'delivered' }
        });
    }
}

export default new DispatchRepository();
