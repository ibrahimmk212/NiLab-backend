"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PerformanceMetrics_1 = __importDefault(require("../models/PerformanceMetrics"));
class PerformanceMetricsRepository {
    async createPerformanceMetrics(data) {
        const performanceMetrics = new PerformanceMetrics_1.default(data);
        return await performanceMetrics.save();
    }
    async findPerformanceMetricsById(metricsId) {
        return await PerformanceMetrics_1.default.findById(metricsId);
    }
    async updatePerformanceMetrics(metricsId, updateData) {
        return await PerformanceMetrics_1.default.findByIdAndUpdate(metricsId, updateData, { new: true });
    }
    async deletePerformanceMetrics(metricsId) {
        return await PerformanceMetrics_1.default.findByIdAndDelete(metricsId, {
            new: true
        });
    }
}
exports.default = new PerformanceMetricsRepository();
