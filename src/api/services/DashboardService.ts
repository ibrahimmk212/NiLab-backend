import DashboardRepository from '../repositories/DashboardRepository';

class DashboardService {
    async getAdminDashboard() {
        return await DashboardRepository.getAdminSummary();
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
