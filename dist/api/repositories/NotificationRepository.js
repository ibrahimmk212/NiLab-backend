"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationRepository {
    async createNotification(data) {
        const notification = new Notification_1.default(data);
        return await notification.save();
    }
    async findNotificationById(notificationId) {
        return await Notification_1.default.findById(notificationId);
    }
    async updateNotification(notificationId, updateData) {
        return await Notification_1.default.findByIdAndUpdate(notificationId, updateData, { new: true });
    }
    async deleteNotification(notificationId) {
        return await Notification_1.default.findByIdAndDelete(notificationId, { new: true });
    }
}
exports.default = new NotificationRepository();
