import DashboardRepository from '../repositories/DashboardRepository';

class DashboardService {
    async getAdminDashboard() {
        const [stats, recentOrders, revenueHistory, orderMetrics, topVendors] = await Promise.all([
            DashboardRepository.getAdminSummary(),
            DashboardRepository.getAdminRecentOrders(),
            DashboardRepository.getAdminRevenueHistory(),
            DashboardRepository.getAdminOrderMetrics(),
            DashboardRepository.getTopVendors()
        ]);

        // Map YYYY-MM-DD to "Mon", "Tue" etc
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedRevenue = revenueHistory.map((item: any) => ({
            day: days[new Date(item._id).getDay()],
            amount: item.revenue
        }));

        return {
            metrics: stats,
            charts: {
                revenue: formattedRevenue,
                orderStatus: orderMetrics[0] || { active: 0, completed: 0, cancelled: 0 },
                topVendors
            },
            recentOrders
        };
    }

    // --- Admin Dashboard Granular Methods ---

    async getAdminStats() {
        return await DashboardRepository.getAdminSummary();
    }

    async getAdminCharts() {
        const [revenueHistory, orderMetrics, topVendors] = await Promise.all([
            DashboardRepository.getAdminRevenueHistory(),
            DashboardRepository.getAdminOrderMetrics(),
            DashboardRepository.getTopVendors()
        ]);

        // Map YYYY-MM-DD to "Mon", "Tue" etc
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedRevenue = revenueHistory.map((item: any) => ({
            day: days[new Date(item._id).getDay()],
            amount: item.revenue
        }));

        return {
            revenue: formattedRevenue,
            orderStatus: orderMetrics[0] || { active: 0, completed: 0, cancelled: 0 },
            topVendors
        };
    }

    async getAdminRecentOrders(limit = 5, startDate?:any, endDate?: any) {
        return await DashboardRepository.getAdminRecentOrders(limit, startDate, endDate);
    }

    async getAdminTopVendors(limit = 5, startDate?: any, endDate?: any) {
        return await DashboardRepository.getTopVendors(limit, startDate, endDate);
    }

    async getAdminVendorApplications(limit = 5, startDate?: any, endDate?: any) {
        return await DashboardRepository.getVendorApplications(limit, startDate, endDate);
    }

    async getVendorDashboard(vendorId: string) {
        return await DashboardRepository.getVendorSummary(vendorId);
    }

    async getVendorSalesAnalytics(
        vendorId: string,
        period: 'daily' | 'weekly' | 'monthly' | 'yearly'
    ) {
        return await DashboardRepository.getVendorSalesAnalytics(
            vendorId,
            period
        );
    }

    async getVendorOrdersStatusCount(vendorId: string) {
        return await DashboardRepository.getVendorOrdersStatusCount(vendorId);
    }

    async getVendorTopSellingProducts(vendorId: string, limit = 5) {
        return await DashboardRepository.getVendorTopSellingProducts(
            vendorId,
            limit
        );
    }

    async getVendorLowStockProducts(vendorId: string, threshold = 5) {
        return await DashboardRepository.getVendorLowStockProducts(
            vendorId,
            threshold
        );
    }

    async getVendorAvailabilityStatus(vendorId: string) {
        return await DashboardRepository.getVendorAvailabilityStatus(vendorId);
    }

    async updateVendorAvailabilityStatus(
        vendorId: string,
        isAvailable: boolean
    ) {
        return await DashboardRepository.updateVendorAvailabilityStatus(
            vendorId,
            isAvailable
        );
    }

    async getVendorRecentOrders(vendorId: string, limit = 5) {
        return await DashboardRepository.getVendorRecentOrders(vendorId, limit);
    }

    async getVendorCustomerReviews(vendorId: string, limit = 5) {
        return await DashboardRepository.getVendorCustomerReviews(
            vendorId,
            limit
        );
    }

    async getRiderDashboard(riderId: string) {
        return await DashboardRepository.getRiderSummary(riderId);
    }

    async getSalesReport(vendorId?: string) {
        return await DashboardRepository.getSalesReport(vendorId);
    }
    async getVendorSalesReport(vendorId: string, year: number) {
        return await DashboardRepository.getVendorSalesReport(vendorId, year);
    }
}

export default new DashboardService();
