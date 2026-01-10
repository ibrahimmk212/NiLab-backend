// repositories/VendorDashboardRepository.ts
import mongoose from 'mongoose';
import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import VendorModel from '../models/Vendor';

export class VendorDashboardRepository {
    async getVendorMetrics(
        vendorId: mongoose.Types.ObjectId,
        todayStart: Date
    ) {
        return OrderModel.aggregate([
            { $match: { vendor: vendorId, createdAt: { $gte: todayStart } } },
            {
                $group: {
                    _id: null,
                    todayNetSales: {
                        $sum: {
                            $cond: [
                                { $ne: ['$status', 'canceled'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    activeOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $in: [
                                        '$status', // note the quotes around $status
                                        [
                                            'pending',
                                            'preparing',
                                            'prepared',
                                            'dispatched'
                                        ]
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);
    }

    async getRecentOrders(vendorId: mongoose.Types.ObjectId, limit = 5) {
        return OrderModel.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'firstName lastName');
    }

    async getWeeklyRevenue(vendorId: mongoose.Types.ObjectId) {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return OrderModel.aggregate([
            {
                $match: {
                    vendor: vendorId,
                    status: 'delivered',
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
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
    }

    async getLowStockItems(vendorId: mongoose.Types.ObjectId, threshold = 10) {
        return ProductModel.find({
            vendor: vendorId,
            stock: { $lt: threshold },
            isDeleted: { $ne: true } // 🔥 Added: Don't show deleted items
        }).limit(2);
    }

    async getVendorProfile(vendorId: mongoose.Types.ObjectId) {
        return VendorModel.findById(vendorId).select(
            'walletBalance averageReadyTime name isAvailable'
        );
    }

    async updateVendorStatus(
        vendorId: mongoose.Types.ObjectId,
        isAvailable: boolean
    ) {
        return VendorModel.findByIdAndUpdate(
            vendorId,
            { isAvailable },
            { new: true, runValidators: true }
        ).select('isAvailable name');
    }

    async getVendorTotalProducts(vendorId: mongoose.Types.ObjectId) {
        return await ProductModel.countDocuments({
            vendor: vendorId,
            isDeleted: { $ne: true }
        });
    }
}
