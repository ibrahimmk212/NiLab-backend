/* eslint-disable @typescript-eslint/no-explicit-any */
// services/VendorDashboardService.ts
import mongoose from 'mongoose';
import { VendorDashboardRepository } from '../repositories/VendorDashboardRepository';

const repo = new VendorDashboardRepository();

export class VendorDashboardService {
    async fetchVendorDashboard(vId: string) {
        const vendorId = new mongoose.Types.ObjectId(vId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [stats, recentOrders, revenueHistory, lowStock, vendor]: any =
            await Promise.all([
                repo.getVendorMetrics(vendorId, todayStart),
                repo.getRecentOrders(vendorId),
                repo.getWeeklyRevenue(vendorId),
                repo.getLowStockItems(vendorId),
                repo.getVendorProfile(vendorId)
            ]);

        // Optional: Map YYYY-MM-DD to "Mon", "Tue" here if frontend needs it simple
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedRevenue = revenueHistory.map((item: any) => ({
            day: days[new Date(item._id).getDay()],
            amount: item.revenue
        }));

        return {
            vendor,
            metrics: {
                // Adjusting to match your vendor profile selection
                walletBalance: vendor?.walletBalance || 0,
                todaySales: stats[0]?.todayNetSales || 0,
                activeOrders: stats[0]?.activeOrders || 0,
                rating: vendor?.ratings || 0
            },
            recentOrders,
            revenueHistory: formattedRevenue,
            lowStock
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
