import DashboardRepository from '../repositories/DashboardRepository';

class DashboardService {
    async getAdminDashboard() {
        return await DashboardRepository.getAdminSummary();
    }

    async getVendorDashboard(vendorId: string) {
        return await DashboardRepository.getVendorSummary(vendorId);
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
