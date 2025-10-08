import mongoose from 'mongoose';
import OrderModel, { Order } from '../models/Order';

class OrderRepository {
    public populatedData = {
        path: 'vendor user rider dispatch order products.product',
        select: '-role -addresses -location -categories -userId -bankAccount'
        // populate: { path: 'products', populate: { path: 'product' } }
    };
    async createOrder(data: Partial<Order>): Promise<Order> {
        const order = new OrderModel(data);
        return await order.save();
    }

    async findOrderById(orderId: string): Promise<Order | null> {
        return await OrderModel.findById(orderId).populate(this.populatedData);
    }

    async findVendorRecentOrders(
        vendorId: string,
        limit: number
    ): Promise<Order[] | null> {
        return await OrderModel.find({ vendor: vendorId })
            .populate(this.populatedData)
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async findOrderByReference(
        paymentReference: string
    ): Promise<Order | null> {
        return await OrderModel.findOne({ paymentReference });
    }
    async findOrderByVendor(
        vendorId: string,
        data: any
    ): Promise<Order[] | null> {
        const total = await OrderModel.countDocuments();
        const page = parseInt(data.page?.toString() || '1', 10);
        const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        return await OrderModel.find({ vendor: vendorId, ...data.queryParams })
            // .skip(startIndex)
            // .limit(limit)
            .sort({ createdAt: -1 })
            .populate(this.populatedData);
    }
    async findAll(options: any) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.vendorId) {
            filter.vendor = options.vendorId;
        }
        if (options.customerId) {
            filter.user = options.customerId;
        }
        if (options.categoryId) {
            filter.category = options.categoryId;
        }
        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }
        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            filter.$text = { $search: options.search };
        }
        if (options.ratings) {
            filter.ratings = { $gte: options.ratings };
        }
        if (options.price) {
            filter.price = { $gte: options.price };
        }
        if (options.description) {
            filter.description = { $regex: options.description, $options: 'i' };
        }
        if (options.images) {
            filter.images = { $exists: true, $ne: [] };
        }
        if (options.thumbnail) {
            filter.thumbnail = { $exists: true, $ne: '' };
        }
        if (options.createdAt) {
            filter.createdAt = { $gte: new Date(options.createdAt) };
        }
        if (options.updatedAt) {
            filter.updatedAt = { $gte: new Date(options.updatedAt) };
        }
        if (options.sortBy) {
            filter.sortBy = options.sortBy;
        }
        if (options.sortOrder) {
            filter.sortOrder = options.sortOrder;
        }

        const [orders, total] = await Promise.all([
            OrderModel.find(filter)
                .populate('categories')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
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
    async findOrderByCustomer(
        customerId: string,
        limit = 10,
        page = 1,
        queryParams: any
    ): Promise<any> {
        const query = { user: customerId, ...queryParams };
        const total = await OrderModel.countDocuments(query);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const orders = await OrderModel.find(query)
            .populate(this.populatedData)
            .sort({ createdAt: -1 })
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

        return { orders, count: orders.length, pagination, total };
    }
    async updateOrder(
        orderId: string,
        updateData: Partial<Order>
    ): Promise<Order | null> {
        return await OrderModel.findByIdAndUpdate(orderId, updateData, {
            new: true
        }).populate({
            path: 'vendor user rider dispatch',
            select: '-role -addresses -location -categories -userId'
        });
    }

    async deleteOrder(order: string): Promise<Order | null> {
        return await OrderModel.findByIdAndDelete(order, { new: true });
    }

    // Additional order-specific methods...
    async vendorAnalytics(
        vendorId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        // Assuming each order has a 'amount' and a 'createdAt' field, and 'vendor' to identify the vendor's orders
        const threeMonthsBeforeStart = new Date(startDate);
        threeMonthsBeforeStart.setMonth(startDate.getMonth() - 3);

        const salesRevenue = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            }
        ]);

        const previousPeriodRevenue = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: threeMonthsBeforeStart,
                        $lte: startDate
                    },
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' }
                }
            }
        ]);

        const salesMargin =
            ((salesRevenue[0]?.amount - previousPeriodRevenue[0]?.amount) /
                previousPeriodRevenue[0]?.amount) *
            100;
        const ordersMargin =
            ((salesRevenue[0]?.count - previousPeriodRevenue[0]?.count) /
                previousPeriodRevenue[0]?.count) *
            100;

        const salesReport = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    dailyRevenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } } // Sorting by date ascending
        ]);

        const productsSoldByCategory = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            { $unwind: '$products' }, // Assuming 'products' is the array of products in each order
            {
                $group: {
                    _id: '$products.category',
                    totalSold: { $sum: '$products.quantity' }
                }
            }
            // Optional: Join with categories collection to replace categoryId with categoryName
        ]);

        // const topSellingProducts = await OrderModel.aggregate([
        //     {
        //         $match: {
        //             createdAt: { $gte: startDate, $lte: endDate },
        //             vendor: new mongoose.Types.ObjectId(vendorId)
        //         }
        //     },
        //     { $unwind: '$products' },
        //     {
        //         $group: {
        //             _id: '$products.product',
        //             // id: '$products.product',
        //             // name: '$products.name',
        //             // price: '$products.price',
        //             sold: { $sum: '$products.quantity' }
        //         }
        //     },
        //     { $sort: { sold: -1 } }, // Sort by sold descending
        //     { $limit: 5 } // Top 5 products
        //     // Optional: Join with products collection to include product details
        // ]);

        const topSellingProducts = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    vendor: new mongoose.Types.ObjectId(vendorId)
                }
            },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.name',
                    totalQuantity: { $sum: '$products.quantity' },
                    totalPrice: {
                        $sum: {
                            $multiply: ['$products.quantity', '$products.price']
                        }
                    }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    productName: '$_id',
                    totalQuantity: 1,
                    totalPrice: 1
                }
            }
        ]);

        return {
            salesRevenue: salesRevenue[0] ?? {},
            previousPeriodRevenue: previousPeriodRevenue[0] ?? {},
            salesMargin: salesMargin ?? 0.0,
            ordersMargin: ordersMargin ?? 0.0,
            salesReport,
            productsSoldByCategory,
            topSellingProducts
        };
    }
    async adminAnalytics(startDate: Date, endDate: Date): Promise<any> {
        // Assuming each order has a 'amount' and a 'createdAt' field, and 'vendor' to identify the vendor's orders
        const threeMonthsBeforeStart = new Date(startDate);
        threeMonthsBeforeStart.setMonth(startDate.getMonth() - 3);

        const salesRevenue = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    amount: { $sum: '$serviceFee' }
                }
            }
        ]);

        const previousPeriodRevenue = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: threeMonthsBeforeStart,
                        $lte: startDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    amount: { $sum: '$serviceFee' }
                }
            }
        ]);

        const salesMargin =
            ((salesRevenue[0]?.amount - previousPeriodRevenue[0]?.amount) /
                previousPeriodRevenue[0]?.amount) *
            100;
        const ordersMargin =
            ((salesRevenue[0]?.count - previousPeriodRevenue[0]?.count) /
                previousPeriodRevenue[0]?.count) *
            100;

        const salesReport = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    dailyRevenue: { $sum: '$serviceFee' }
                }
            },
            { $sort: { _id: 1 } } // Sorting by date ascending
        ]);

        const productsSoldByCategory = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            // { $unwind: '$products' }, // Assuming 'products' is the array of products in each order
            {
                $group: {
                    _id: '$orderType',
                    count: { $sum: 1 }
                }
            }
            // Optional: Join with categories collection to replace categoryId with categoryName
        ]);

        // const topSellingProducts = await OrderModel.aggregate([
        //     {
        //         $match: {
        //             createdAt: { $gte: startDate, $lte: endDate },
        //
        //         }
        //     },
        //     { $unwind: '$products' },
        //     {
        //         $group: {
        //             _id: '$products.product',
        //             // id: '$products.product',
        //             // name: '$products.name',
        //             // price: '$products.price',
        //             sold: { $sum: '$products.quantity' }
        //         }
        //     },
        //     { $sort: { sold: -1 } }, // Sort by sold descending
        //     { $limit: 5 } // Top 5 products
        //     // Optional: Join with products collection to include product details
        // ]);

        const topSellingProducts = await OrderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.name',
                    totalQuantity: { $sum: '$products.quantity' },
                    totalPrice: {
                        $sum: {
                            $multiply: ['$products.quantity', '$products.price']
                        }
                    }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    productName: '$_id',
                    totalQuantity: 1,
                    totalPrice: 1
                }
            }
        ]);

        return {
            salesRevenue: salesRevenue[0] ?? {},
            previousPeriodRevenue: previousPeriodRevenue[0] ?? {},
            salesMargin: salesMargin ?? 0.0,
            ordersMargin: ordersMargin ?? 0.0,
            salesReport,
            productsSoldByCategory,
            topSellingProducts
        };
    }
}

export default new OrderRepository();
