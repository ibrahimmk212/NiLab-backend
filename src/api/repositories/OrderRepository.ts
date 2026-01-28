/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { ClientSession } from 'mongoose';
import OrderModel, { Order } from '../models/Order';
import DeliveryModel from '../models/Delivery';
import Payment from '../models/Payment';
import PayoutModel from '../models/Payout';
import TransactionModel from '../models/Transaction';

class OrderRepository {
    // Optimized population to exclude sensitive data across the board

    /**
     * Create Order with Session support for Atomicity
     */
    async createOrder(
        data: Partial<Order>,
        session?: ClientSession
    ): Promise<Order> {
        const order = new OrderModel(data);
        return await order.save({ session });
    }

    async findOrderById(orderId: string): Promise<Order | null> {
        return await OrderModel.findById(orderId).populate(
            'user vendor rider products'
        );
    }

    /**
     * Find by NanoID Code (Customer Facing)
     */
    async findOrderByCode(code: string): Promise<Order | null> {
        return await OrderModel.findOne({ code }).populate(
            'user vendor rider products'
        );
    }

    /**
     * Find by NanoID Reference (System/Payment Facing)
     */
    async findOrderByPaymentReference(
        paymentReference: string,
        session?: ClientSession
    ): Promise<Order | null> {
        return await OrderModel.findOne({ paymentReference })
            .populate('user vendor rider products')
            .session(session || null); // Ensure session is explicitly handled
    }

    async updateOrder(
        orderId: string,
        updateData: Partial<Order>,
        session?: ClientSession
    ): Promise<Order | null> {
        return await OrderModel.findByIdAndUpdate(orderId, updateData, {
            new: true,
            session
        }).populate('user vendor rider products');
    }

    /**
     * Optimized Analytics for Vendor Performance
     */
    async vendorAnalytics(
        vendorId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        const vId = new mongoose.Types.ObjectId(vendorId);

        const [revenueData, topProducts] = await Promise.all([
            OrderModel.aggregate([
                {
                    $match: {
                        vendor: vId,
                        status: 'delivered',
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$totalAmount' },
                        totalCommission: { $sum: '$commission' },
                        orderCount: { $sum: 1 }
                    }
                }
            ]),
            OrderModel.aggregate([
                { $match: { vendor: vId, status: 'delivered' } },
                { $unwind: '$products' },
                {
                    $group: {
                        _id: '$products.name',
                        quantity: { $sum: '$products.quantity' },
                        revenue: {
                            $sum: {
                                $multiply: [
                                    '$products.quantity',
                                    '$products.price'
                                ]
                            }
                        }
                    }
                },
                { $sort: { quantity: -1 } },
                { $limit: 5 }
            ])
        ]);

        return {
            summary: revenueData[0] || {
                totalRevenue: 0,
                totalCommission: 0,
                orderCount: 0
            },
            topProducts
        };
    }

    async findAll(options: any) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        // Add support for new reference searches
        if (options.code) filter.code = options.code;
        if (options.reference) filter.paymentReference = options.reference;
        if (options.vendorId) filter.vendor = options.vendorId;
        if (options.customerId) filter.user = options.customerId;
        if (options.status) filter.status = options.status;
        if (options.riderId) filter.rider = options.riderId;
        if (options.search) {
            const searchRegex = new RegExp(options.search, 'i');
            filter.$or = [
                { 'user.firstName': searchRegex },
                { 'user.lastName': searchRegex },
                { 'vendor.businessName': searchRegex },
                { 'rider.firstName': searchRegex },
                { 'rider.lastName': searchRegex },
                { code: searchRegex },
                { paymentReference: searchRegex }
            ];
        }
        if (options.sortBy) {
            filter.sort = {};
            filter.sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
        }
        if (options.paymentCompleted !== undefined) {
            filter.paymentCompleted = options.paymentCompleted;
        }

        // Date Range Filtering
        if (options.startDate && options.endDate) {
            filter.createdAt = {
                $gte: new Date(options.startDate),
                $lte: new Date(options.endDate)
            };
        }

        if (options.orderType) filter.orderType = options.orderType;

        const [orders, total] = await Promise.all([
            OrderModel.find(filter)
                .populate('user vendor rider products')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            OrderModel.countDocuments(filter)
        ]);

        return {
            total,
            count: orders.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: orders
        };
    }

    // Delete All Delivery, Order, Payment, Payout, Transaction for Testing
    async deleteAll() {
        await OrderModel.deleteMany({});
        await DeliveryModel.deleteMany({});
        await Payment.deleteMany({});
        await PayoutModel.deleteMany({});
        await TransactionModel.deleteMany({});
        return true;
    }
}

export default new OrderRepository();
