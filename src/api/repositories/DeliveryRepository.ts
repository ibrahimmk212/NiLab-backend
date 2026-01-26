import mongoose, { SessionOption } from 'mongoose';
import DeliveryModel, { Delivery } from '../models/Delivery';
import RiderModel from '../models/Rider';

class DeliveryRepository {
    async createDelivery(deliveryData: Partial<Delivery>): Promise<Delivery> {
        const delivery = new DeliveryModel(deliveryData);
        return await delivery.save();
    }
    async getAll(options: any) {
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
        // if (options.pickupState) filter['pickup.state'] = options.pickupState;
        if (options.receiverPhone)
            filter['receiverDetails.contactNumber'] = options.receiverPhone;
        if (options.deliveryCode) filter.deliveryCode = options.deliveryCode;
        if (options.sortBy) {
            filter.sort = {};
            filter.sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
        }

        if (options.orderType) filter.orderType = options.orderType;

        const [deliveries, total] = await Promise.all([
            DeliveryModel.find(filter)
                .populate({
                    path: 'order rider dispatch',
                    populate: {
                        path: 'vendor'
                    }
                })
                .skip(skip)
                .limit(limit),
            DeliveryModel.countDocuments(filter)
        ]);

        return {
            total,
            count: deliveries.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: deliveries
        };
    }

    // repositories/DeliveryRepository.ts

    async updateDelivery(
        deliveryId: string,
        updateData: any,
        session?: mongoose.ClientSession // Standardize the session type
    ): Promise<Delivery | null> {
        return await DeliveryModel.findByIdAndUpdate(deliveryId, updateData, {
            new: true,
            session
        }).populate([
            {
                path: 'order',
                populate: { path: 'vendor' }
            },
            {
                path: 'rider',
                // If Rider profile links to a User, populate that too
                populate: { path: 'userId', select: 'firstName lastName phone' }
            },
            {
                path: 'dispatch'
            }
        ]);
    }

    async getAvailableDeliveries(state: string): Promise<Delivery[]> {
        return await DeliveryModel.find({
            rider: null,
            'pickup.state': state
        })
            .populate({
                path: 'order rider dispatch',
                populate: {
                    path: 'vendor'
                }
            })
            .sort({ createdAt: -1 }); // Most recent first
    }

    async getDeliveryById(deliveryId: string): Promise<Delivery | null> {
        return await DeliveryModel.findById(deliveryId).populate({
            path: 'order rider dispatch',
            populate: {
                path: 'vendor'
            }
        });
    }

    async getDeliveryByOrder(orderId: string): Promise<Delivery | null> {
        return await DeliveryModel.findOne({ orderId: orderId }).populate({
            path: 'order rider dispatch',
            populate: {
                path: 'vendor'
            }
        });
    }
    async getDeliveriesForRider(
        rider: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await DeliveryModel.countDocuments({ rider });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const deliveries = await DeliveryModel.find({ rider })
            .populate({
                path: 'order rider dispatch',
                populate: {
                    path: 'vendor'
                }
            })
            .sort({ createdAt: -1 }) // Most recent first
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { deliveries, count: deliveries.length, pagination, total };
    }

    async getActiveDeliveries(rider: string): Promise<Delivery[]> {
        return await DeliveryModel.find({
            rider,
            status: { $ne: 'delivered' }
        })
            .populate({
                path: 'order rider dispatch',
                populate: {
                    path: 'vendor'
                }
            })
            .sort({ createdAt: -1 }); // Most recent first
    }

    // Additional order-specific methods...
    async riderAnalytics(
        riderId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        const totalDeliveries = await RiderModel.countDocuments({
            riderId: riderId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'delivered' // Assuming 'delivered' indicates a completed delivery
        });

        const ongoingDeliveries = await RiderModel.countDocuments({
            riderId: riderId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'in-transit' // Assuming 'delivered' indicates a completed delivery
        });

        const totalEarnings = await RiderModel.aggregate([
            {
                $match: {
                    riderId: riderId,
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'delivered'
                }
            },
            { $group: { _id: null, totalEarnings: { $sum: '$deliveryFee' } } }
        ]);

        // const averageDeliveryTime = await RiderModel.aggregate([
        //     {
        //         $match: {
        //             riderId: riderId,
        //             createdAt: { $gte: startDate, $lte: endDate },
        //             status: 'delivered'
        //         }
        //     },
        //     { $group: { _id: null, averageTime: { $avg: '$deliveryTime' } } }
        // ]);

        const totalAssignedDeliveries = await RiderModel.countDocuments({
            riderId: riderId,
            createdAt: { $gte: startDate, $lte: endDate }
        });

        const successfulDeliveries = await RiderModel.countDocuments({
            riderId: riderId,
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'delivered'
        });

        const successRate =
            (successfulDeliveries / totalAssignedDeliveries) * 100;

        return {
            totalDeliveries,
            totalEarnings: totalEarnings[0] ?? 0,
            ongoingDeliveries,
            successRate: successRate ?? 0
        };
    }
    // Add more methods as needed...
}

export default new DeliveryRepository();
