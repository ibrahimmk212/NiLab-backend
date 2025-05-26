import LogModel, { Log } from '../models/Log';

class LogRepository {
    async createLog(data: Log): Promise<Log> {
        const log = new LogModel(data);
        return await log.save();
    }

    async findLogById(logId: string): Promise<Log | null> {
        return await LogModel.findById(logId);
    }

    async updateLog(
        logId: string,
        updateData: Partial<Log>
    ): Promise<Log | null> {
        return await LogModel.findByIdAndUpdate(logId, updateData, {
            new: true
        });
    }

    async deleteLog(logId: string): Promise<Log | null> {
        return await LogModel.findByIdAndDelete(logId, { new: true });
    }

    // Additional log-specific methods...
}

export default new LogRepository();
