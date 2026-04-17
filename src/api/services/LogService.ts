import LogRepository from '../repositories/LogRepository';
import LogModel from '../models/Log';

class LogService {
    async getAllLogs(query: any) {
        const { page = 1, limit = 20, search } = query;
        const skip = (page - 1) * limit;

        const filters: any = {};
        if (search) {
            filters.action = { $regex: search, $options: 'i' };
        }

        const logs = await LogModel.find(filters)
            .populate('userId', 'firstName lastName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await LogModel.countDocuments(filters);

        return {
            data: logs,
            total,
            page: Number(page),
            limit: Number(limit)
        };
    }

    async recordAction(userId: string, action: string) {
        return await LogRepository.createLog({
            userId,
            action
        } as any);
    }
}

export default new LogService();
