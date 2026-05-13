/* eslint-disable @typescript-eslint/no-explicit-any */
// services/VendorDashboardService.ts
import mongoose from 'mongoose';
import { VendorDashboardRepository } from '../repositories/VendorDashboardRepository';

const repo = new VendorDashboardRepository();

export class VendorDashboardService {
    async fetchVendorDashboard(vId: string, period: string = 'week') {
        const vendorId = new mongoose.Types.ObjectId(vId);
        let startDate = new Date();
        let dateFormat = '%Y-%m-%d';
        
        switch (period) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                dateFormat = '%H:00';
                break;
            case 'week':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                dateFormat = '%Y-%m-%d';
                break;
            case 'month':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                dateFormat = '%Y-%m-%d';
                break;
            case 'year':
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                dateFormat = '%Y-%m';
                break;
            default:
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        const [
            stats,
            recentOrders,
            revenueHistory,
            lowStock,
            vendor,
            productsCount,
            activeComplaints,
            topProducts
        ]: any = await Promise.all([
            repo.getVendorMetrics(vendorId, startDate),
            repo.getRecentOrders(vendorId),
            repo.getRevenueAnalytics(vendorId, startDate, dateFormat),
            repo.getLowStockItems(vendorId),
            repo.getVendorProfile(vendorId),
            repo.getVendorTotalProducts(vendorId),
            repo.getVendorComplaintsCount(vendorId),
            repo.getTopSellingProducts(vendorId)
        ]);

        // Map revenue history labels
        const formattedRevenue = revenueHistory.map((item: any) => {
            let label = item._id;
            if (period === 'week' || period === 'month') {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                label = days[new Date(item._id).getDay()];
            } else if (period === 'year') {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                label = months[new Date(item._id + '-01').getMonth()];
            }
            return {
                day: label,
                amount: item.revenue
            };
        });

        return {
            vendor,
            metrics: {
                productsCount,
                periodNetSales: stats[0]?.periodNetSales || 0,
                activeOrders: stats[0]?.activeOrders || 0,
                activeComplaints,
                rating: vendor?.ratings || 0
            },
            recentOrders,
            revenueHistory: formattedRevenue,
            lowStock,
            topProducts
        };
    }

    async toggleVendorAvailability(vId: string, status: boolean): Promise<any> {
        const vendorId = new mongoose.Types.ObjectId(vId);
        const updatedVendor = await repo.updateVendorStatus(vendorId, status);

        if (!updatedVendor) {
            throw new Error('Vendor not found');
        }

        return updatedVendor;
    }
}
