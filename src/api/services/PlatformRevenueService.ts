import PlatformRevenueRepository from '../repositories/PlatformRevenueRepository';
import { generateReference } from '../../utils/keygen/idGenerator';
import { ClientSession } from 'mongoose';

class PlatformRevenueService {
    async recordOrderRevenue(order: any, config: any, session: ClientSession) {
        // Calculation logic
        const platformFee = (order.amount * config.vendorCommission) / 100;

        // Net profit is the commission from the food + the fixed service fee
        const totalProfit = platformFee + order.serviceFee;

        return await PlatformRevenueRepository.createRecord(
            {
                reference: generateReference('REV'),
                sourceType: 'ORDER',
                sourceId: order._id,
                grossAmount: order.totalAmount,
                commissionRate: config.vendorCommission,
                commissionAmount: platformFee,
                netAmount: totalProfit,
                payer: order.user,
                payee: order.vendor,
                status: 'SETTLED'
            },
            session
        );
    }

    async getAdminDashboardStats(days: number = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        const [summary, sources] = await Promise.all([
            PlatformRevenueRepository.getEarningsReport(startDate, endDate),
            PlatformRevenueRepository.getRevenueBySource(startDate, endDate)
        ]);

        return {
            summary: summary[0] || {
                totalGross: 0,
                totalNetProfit: 0,
                count: 0
            },
            byCategory: sources
        };
    }
}

export default new PlatformRevenueService();
