import PerformanceMetricsModel, {
    PerformanceMetrics
} from '../models/PerformanceMetrics';

class PerformanceMetricsRepository {
    async createPerformanceMetrics(
        data: PerformanceMetrics
    ): Promise<PerformanceMetrics> {
        const performanceMetrics = new PerformanceMetricsModel(data);
        return await performanceMetrics.save();
    }

    async findPerformanceMetricsById(
        metricsId: string
    ): Promise<PerformanceMetrics | null> {
        return await PerformanceMetricsModel.findById(metricsId);
    }

    async updatePerformanceMetrics(
        metricsId: string,
        updateData: Partial<PerformanceMetrics>
    ): Promise<PerformanceMetrics | null> {
        return await PerformanceMetricsModel.findByIdAndUpdate(
            metricsId,
            updateData,
            { new: true }
        );
    }

    async deletePerformanceMetrics(
        metricsId: string
    ): Promise<PerformanceMetrics | null> {
        return await PerformanceMetricsModel.findByIdAndDelete(metricsId, {
            new: true
        });
    }

    // Additional methods for performance metrics...
}

export default new PerformanceMetricsRepository();
