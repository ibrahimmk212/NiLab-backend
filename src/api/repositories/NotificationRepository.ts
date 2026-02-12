/* eslint-disable @typescript-eslint/no-explicit-any */
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

    // get all
    async getAll(options: any) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.vendorId) {
            filter.vendorId = options.vendorId;
        }
        if (options.riderId) {
            filter.riderId = options.riderId;
        }
        if (options.userId) {
            filter.userId = options.userId;
        }
        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            filter.$text = { $search: options.search };
        }
        if (options.createdAt) {
            filter.createdAt = { $gte: new Date(options.createdAt) };
        }
        if (options.updatedAt) {
            filter.updatedAt = { $gte: new Date(options.updatedAt) };
        }
        if (options.sortBy) {
            filter.sortBy = options.sortBy;
        }
        if (options.sortOrder) {
            filter.sortOrder = options.sortOrder;
        }

        const [notifications, total] = await Promise.all([
            NotificationModel.find(filter)
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            NotificationModel.countDocuments(filter)
        ]);

        return {
            total,
            count: notifications.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: notifications
        };
    }

    async deleteNotification(
        notificationId: string
    ): Promise<Notification | null> {
        return await NotificationModel.findByIdAndDelete(notificationId, {
            new: true
        });
    }

    async markAllAsRead(userId: string): Promise<any> {
        return await NotificationModel.updateMany(
            { userId: userId, status: 'unread' },
            { $set: { status: 'read' } }
        );
    }

    async deleteAll(userId: string): Promise<any> {
        return await NotificationModel.deleteMany({ userId: userId });
    }

    // Additional notification-specific methods...
}

export default new NotificationRepository();
