import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import UserModel from '../models/User';

import RiderModel from '../models/Rider';
import VendorModel from '../models/Vendor';
import WalletModel from '../models/Wallet';
import ReviewModel from '../models/Review';

import ComplaintModel from '../models/Complaint';
import PayoutModel from '../models/Payout';

class DashboardRepository {
    // Admin dashboard summary
    async getAdminSummary() {
        const productsCount = await ProductModel.countDocuments();
        const ordersCount = await OrderModel.countDocuments();
        const vendorsCount = await VendorModel.countDocuments();
        const ridersCount = await RiderModel.countDocuments();
        const customersCount = await UserModel.countDocuments({ role: 'user' });
        
        const pendingComplaints = await ComplaintModel.countDocuments({ status: 'pending' });
        const pendingPayouts = await PayoutModel.countDocuments({ status: 'pending' });

        const revenueStats = await OrderModel.aggregate([
            { $match: { status: 'completed' } },
            { 
                $group: { 
                    _id: null, 
                    gmv: { $sum: '$amount' },
                    revenue: { 
                        $sum: { 
                            $add: [
                                { $multiply: ['$amount', { $divide: ['$commission', 100] }] },
                                { $ifNull: ['$serviceFee', 0] }
                            ]
                        } 
                    }
                } 
            }
        ]);

        const gmv = revenueStats[0]?.gmv || 0;
        const revenue = revenueStats[0]?.revenue || 0;

        return {
            products: productsCount,
            orders: ordersCount,
            vendors: vendorsCount,
            riders: ridersCount,
            customers: customersCount,
            pendingComplaints,
            pendingPayouts,
            gmv,
            revenue
        };
    }
    // Vendor dashboard summary
    async getVendorSummary(vendorId: string) {
        const productsCount = await ProductModel.countDocuments({
            vendor: vendorId
        });
        const ordersCount = await OrderModel.countDocuments({
            vendor: vendorId
        });

        const completedOrdersCount = await OrderModel.countDocuments({
            vendor: vendorId,
            status: 'completed'
        });
        const pendingOrdersCount = await OrderModel.countDocuments({
            vendor: vendorId,
            status: 'pending'
        });
        const storeRating = await VendorModel.findById(vendorId).select(
            'ratings'
        );

        const revenue = await OrderModel.aggregate([
            { $match: { vendor: vendorId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            products: productsCount,
            orders: ordersCount,
            completedOrders: completedOrdersCount,
            pendingOrders: pendingOrdersCount,
            storeRating: storeRating?.ratings || 0,
            revenue: revenue[0]?.total || 0
        };
    }
    // Vendor sales analytics
    async getVendorSalesAnalytics(
        vendorId: string,
        period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    ) {
        let groupBy: any = {};
        let dateFormat = '';
        switch (period) {
            case 'daily':
                groupBy = { day: { $dayOfMonth: '$createdAt' } };
                dateFormat = '%Y-%m-%d';
                break;
            case 'weekly':
                groupBy = { week: { $week: '$createdAt' } };
                dateFormat = '%Y-%U';
                break;
            case 'monthly':
                groupBy = { month: { $month: '$createdAt' } };
                dateFormat = '%Y-%m';
                break;
            case 'yearly':
                groupBy = { year: { $year: '$createdAt' } };
                dateFormat = '%Y';
                break;
        }

        const sales = await OrderModel.aggregate([
            {
                $match: {
                    vendor: vendorId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format the response based on the period
        const labels: string[] = [];
        const salesData: number[] = [];
        const ordersData: number[] = [];

        sales.forEach((item) => {
            let label = '';
            switch (period) {
                case 'daily':
                    label = new Date(
                        item._id.year,
                        item._id.month - 1,
                        item._id.day
                    ).toLocaleDateString();
                    break;
                case 'weekly':
                    label = `Week ${item._id.week}`;
                    break;
                case 'monthly':
                    label = new Date(
                        item._id.year,
                        item._id.month - 1
                    ).toLocaleString('default', { month: 'short' });
                    break;
                case 'yearly':
                    label = item._id.year.toString();
                    break;
            }
            labels.push(label);
            salesData.push(item.total);
            ordersData.push(item.orders);
        });

        return {
            labels,
            sales: salesData,
            orders: ordersData
        };
    }

    // Vendor Orders Status Count
    async getVendorOrdersStatusCount(vendorId: string) {
        const orderStatus = [
            'pending',
            'preparing',
            'prepared',
            'dispatched',
            'delivered',
            'cancelled'
        ];
        const statusCount: any = {};
        for (const status of orderStatus) {
            statusCount[status] = await OrderModel.countDocuments({
                vendor: vendorId,
                status
            });
        }

        return statusCount;
    }

    // Vendor top Selling Products
    async getVendorTopSellingProducts(vendorId: string, limit = 5) {
        return await OrderModel.aggregate([
            { $match: { vendor: vendorId, status: 'completed' } },
            {
                $group: {
                    _id: '$productId',
                    totalSold: { $sum: '$quantity' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: limit }
        ]);
    }

    // Rider dashboard summary
    async getRiderSummary(riderId: string) {
        const completedDeliveries = await OrderModel.countDocuments({
            riderId,
            status: 'delivered'
        });

        const pendingDeliveries = await OrderModel.countDocuments({
            riderId,
            status: 'assigned'
        });

        const earnings = await WalletModel.findOne({
            owner: riderId,
            role: 'rider'
        });

        return {
            completedDeliveries,
            pendingDeliveries,
            earnings: earnings?.availableBalance || 0
        };
    }

    // get store (Vendor) availability status
    async getVendorAvailabilityStatus(vendorId: string) {
        const vendor = await VendorModel.findById(vendorId).select(
            'isAvailable'
        );
        return vendor?.isAvailable || false;
    }

    // update store (Vendor) availability status
    async updateVendorAvailabilityStatus(
        vendorId: string,
        isAvailable: boolean
    ) {
        return await VendorModel.findByIdAndUpdate(
            vendorId,
            { isAvailable },
            { new: true } // new option to return the updated document
        );
    }

    // Low stock alert
    async getVendorLowStockProducts(vendorId: string, threshold = 5) {
        return await ProductModel.find({
            vendor: vendorId,
            stock: { $lte: threshold }
        }).limit(10);
    }

    // Get vendor's sales report
    async getVendorSalesReport(vendorId: string, year: number) {
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31`);

        const sales = await OrderModel.aggregate([
            {
                $match: {
                    vendorId,
                    status: 'completed',
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);

        // Map result into all 12 months
        const monthlySales = Array.from({ length: 12 }, (_, i) => {
            const monthData = sales.find((s) => s._id.month === i + 1);
            return {
                month: new Date(0, i).toLocaleString('en', { month: 'short' }),
                amount: monthData ? monthData.total : 0
            };
        });

        return { year, monthlySales };
    }

    // Admin Recent Orders
    async getAdminRecentOrders(limit = 5, startDate?: Date, endDate?: Date) {
        const query: any = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        return await OrderModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'firstName lastName')
            .populate('vendor', 'name');
    }

    // Admin Revenue History (Weekly)
    async getAdminRevenueHistory() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return await OrderModel.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: sevenDaysAgo }
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
                    revenue: {
                        $sum: {
                            $add: [
                                { $multiply: ['$amount', { $divide: ['$commission', 100] }] },
                                { $ifNull: ['$serviceFee', 0] }
                            ]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    // Get Vendor recent orders
    async getVendorRecentOrders(vendorId: string, limit = 5) {
        return await OrderModel.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'firstName lastName');
    }

    // Vendor Customer Reviews
    async getVendorCustomerReviews(vendorId: string, limit = 5) {
        return await ReviewModel.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    // Sales report (for chart)
    async getSalesReport(vendorId?: string) {
        const match: any = { status: 'completed' };
        if (vendorId) match.vendorId = vendorId;

        return await OrderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { month: { $month: '$createdAt' } },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.month': 1 } }
        ]);
    }
    // Top Vendors by GMV
    async getTopVendors(limit = 5, startDate?: Date, endDate?: Date) {
        const match: any = { status: 'completed' };
        if (startDate && endDate) {
            match.createdAt = { $gte: startDate, $lte: endDate };
        }

        return await OrderModel.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$vendor',
                    totalOrders: { $sum: 1 },
                    gmv: { $sum: '$amount' },
                    revenue: {
                        $sum: {
                            $add: [
                                { $multiply: ['$amount', { $divide: ['$commission', 100] }] },
                                { $ifNull: ['$serviceFee', 0] }
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'vendors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendor'
                }
            },
            { $unwind: '$vendor' },
            {
                $project: {
                    name: '$vendor.name',
                    totalOrders: 1,
                    gmv: 1,
                    revenue: 1
                }
            },
            { $sort: { gmv: -1 } },
            { $limit: limit }
        ]);
    }

    // Admin Order Metrics (Pie Chart)
    async getAdminOrderMetrics() {
        return await OrderModel.aggregate([
            {
                $group: {
                    _id: null,
                    active: {
                        $sum: {
                            $cond: [{ $in: ['$status', ['pending', 'preparing', 'prepared', 'dispatched']] }, 1, 0]
                        }
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $in: ['$status', ['canceled', 'cancelled']] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    active: 1,
                    completed: 1,
                    cancelled: 1
                }
            }
        ]);
    }
    // Recent Vendor Applications (Pending Verification)
    async getVendorApplications(limit = 5, startDate?: Date, endDate?: Date) {
        const query: any = { identityVerificationStatus: 'pending' };
        if (startDate && endDate) {
            query.createdAt = { $gte: startDate, $lte: endDate };
        }
        return await VendorModel.find(query)
            .select('name email phoneNumber identityType identityNumber createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);
    }
}

export default new DashboardRepository();
