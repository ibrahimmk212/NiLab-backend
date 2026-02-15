import mongoose, { SessionOption } from 'mongoose';
import DeliveryModel, { Delivery } from '../models/Delivery';
import RiderModel from '../models/Rider';
import OrderModel from '../models/Order';
import DispatchModel from '../models/Dispatch';

class DeliveryRepository {
    async createDelivery(
        deliveryData: Partial<Delivery>,
        session?: mongoose.ClientSession
    ): Promise<Delivery> {
        const delivery = new DeliveryModel(deliveryData, session);
        return await delivery.save();
    }
    async getAll(options: any) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.riderId) filter.rider = options.riderId;

        // If we want "Active", we pass an array of statuses to options.status
        if (options.status) {
            if (Array.isArray(options.status)) {
                filter.status = { $in: options.status };
            } else {
                filter.status = options.status;
            }
        } else if (options.isActiveSearch) {
            // If we just want everything NOT delivered or canceled
            filter.status = { $in: ['accepted', 'picked', 'in-transit'] };
        }
        // Add support for new reference searches
        // if (options.status) filter.status = options.status;
        // if (options.riderId) filter.rider = options.riderId;
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
        if (options.receiverPhone)
            filter['receiverDetails.contactNumber'] = options.receiverPhone;
        if (options.deliveryCode) filter.deliveryCode = options.deliveryCode;
        let sortOptions: any = { createdAt: -1 };

        if (options.sortBy) {
            sortOptions = {};
            sortOptions[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
        }

        if (options.orderType) filter.orderType = options.orderType;

        console.log('Final Filter for getAll:', JSON.stringify(filter, null, 2));

        const [deliveries, total] = await Promise.all([
            DeliveryModel.find(filter)
                .sort(sortOptions)
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

    async assignRiderToDelivery(
        deliveryId: string,
        riderId: string,
        dispatchId: string,
        session: mongoose.ClientSession
    ) {
        return await DeliveryModel.findOneAndUpdate(
            { _id: deliveryId, rider: { $exists: false } }, // Atomic check: only if not assigned
            {
                $set: {
                    rider: riderId,
                    dispatch: dispatchId,
                    status: 'assigned'
                }
            },
            { session, new: true }
        );
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

    // Release unattended accepted Deliveries (usually by CRON JOB)
    async getAndReleaseStaleDeliveries(minutes: number): Promise<string[]> {
        const cutoff = new Date(Date.now() - minutes * 60000);

        // 1. Find the affected deliveries
        const staleDeliveries = await DeliveryModel.find({
            status: 'accepted',
            updatedAt: { $lt: cutoff },
            rider: { $ne: null }
        }).select('_id order dispatch');

        if (staleDeliveries.length === 0) return [];

        const deliveryIds = staleDeliveries.map((d) => d._id);
        const orderIds = staleDeliveries.map((d) => d.order);
        const dispatchIds = staleDeliveries
            .map((d) => d.dispatch)
            .filter(Boolean);

        // 2. Reset Deliveries
        await DeliveryModel.updateMany(
            { _id: { $in: deliveryIds } },
            {
                $set: { status: 'pending', rider: null, dispatch: null },
                $unset: { acceptedAt: '' }
            }
        );

        // 3. Reset Orders (Crucial for the Vendor/Customer view)
        await OrderModel.updateMany(
            { _id: { $in: orderIds } },
            { $set: { rider: null, deliveryAccepted: false } }
        );

        // 4. Remove from Dispatch arrays
        if (dispatchIds.length > 0) {
            await DispatchModel.updateMany(
                { _id: { $in: dispatchIds } },
                { $pull: { deliveries: { $in: deliveryIds } } }
            );
        }

        return deliveryIds.map((id) => id.toString());
    }
}

export default new DeliveryRepository();
