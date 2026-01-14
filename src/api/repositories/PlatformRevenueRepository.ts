import PlatformRevenueModel, {
    PlatformRevenue
} from '../models/PlatformRevenue';
import mongoose, { ClientSession } from 'mongoose';

class PlatformRevenueRepository {
    async createRecord(
        data: Partial<PlatformRevenue>,
        session?: ClientSession
    ) {
        return await PlatformRevenueModel.create([data], { session });
    }

    async getEarningsReport(startDate: Date, endDate: Date) {
        return await PlatformRevenueModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'SETTLED'
                }
            },
            {
                $group: {
                    _id: null,
                    totalGross: { $sum: '$grossAmount' },
                    totalCommission: { $sum: '$commissionAmount' },
                    totalNetProfit: { $sum: '$netAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    async getRevenueBySource(startDate: Date, endDate: Date) {
        return await PlatformRevenueModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: 'SETTLED'
                }
            },
            {
                $group: {
                    _id: '$sourceType',
                    revenue: { $sum: '$netAmount' },
                    volume: { $sum: 1 }
                }
            }
        ]);
    }
}

export default new PlatformRevenueRepository();
