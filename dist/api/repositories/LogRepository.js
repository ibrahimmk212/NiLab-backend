"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __importDefault(require("../models/Log"));
class LogRepository {
    async createLog(data) {
        const log = new Log_1.default(data);
        return await log.save();
    }
    async findLogById(logId) {
        return await Log_1.default.findById(logId);
    }
    async updateLog(logId, updateData) {
        return await Log_1.default.findByIdAndUpdate(logId, updateData, {
            new: true
        });
    }
    async deleteLog(logId) {
        return await Log_1.default.findByIdAndDelete(logId, { new: true });
    }
}
exports.default = new LogRepository();
