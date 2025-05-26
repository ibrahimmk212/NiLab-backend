import NotificationModel, { Notification } from '../models/Notification';

class NotificationRepository {
    async createNotification(data: Notification): Promise<Notification> {
        const notification = new NotificationModel(data);
        return await notification.save();
    }

    async findNotificationById(
        notificationId: string
    ): Promise<Notification | null> {
        return await NotificationModel.findById(notificationId);
    }

    async updateNotification(
        notificationId: string,
        updateData: Partial<Notification>
    ): Promise<Notification | null> {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            updateData,
            { new: true }
        );
    }

    async deleteNotification(
        notificationId: string
    ): Promise<Notification | null> {
        return await NotificationModel.findByIdAndDelete(notificationId, {new:true});
    }

    // Additional notification-specific methods...
}

export default new NotificationRepository();
