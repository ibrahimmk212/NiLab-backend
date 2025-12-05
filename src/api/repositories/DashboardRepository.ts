import OrderModel from '../models/Order';
import ProductModel from '../models/Product';
import RiderModel from '../models/Rider';
import VendorModel from '../models/Vendor';
import WalletModel from '../models/Wallet';

class DashboardRepository {
    // Admin dashboard summary
    async getAdminSummary() {
        const productsCount = await ProductModel.countDocuments();
        const ordersCount = await OrderModel.countDocuments();
        const vendorsCount = await VendorModel.countDocuments();
        const ridersCount = await RiderModel.countDocuments();
        const revenue = await OrderModel.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            products: productsCount,
            orders: ordersCount,
            vendors: vendorsCount,
            riders: ridersCount,
            revenue: revenue[0]?.total || 0
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
        const revenue = await OrderModel.aggregate([
            { $match: { vendor: vendorId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            products: productsCount,
            orders: ordersCount,
            revenue: revenue[0]?.total || 0
        };
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
}

export default new DashboardRepository();
