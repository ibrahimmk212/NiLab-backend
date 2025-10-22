/* eslint-disable @typescript-eslint/no-explicit-any */
import NotificationRepository from '../repositories/NotificationRepository';
import ProductModel, { Notification } from '../models/Notification';
interface INotificationService {
    create(payload: any): Promise<any>;
    getAll(data: any): Promise<any[]>;
    get(Id: string): Promise<any>;
    update(Id: string, data: any): Promise<boolean>;
    delete(userId: string): Promise<boolean>;
}

class NotificationService implements INotificationService {
    async create(payload: any): Promise<any> {
        return await NotificationRepository.createNotification(payload);
    }

    async get(id: string): Promise<Notification | null> {
        return await NotificationRepository.findNotificationById(id);
    }
    async getAll(data: any): Promise<any> {
        return await NotificationRepository.getAll(data);
    }

    async update(
        notificationId: string,
        updateData: Partial<Notification>
    ): Promise<any> {
        return await NotificationRepository.updateNotification(
            notificationId,
            updateData
        );
    }

    async delete(notificationId: string): Promise<any> {
        return await NotificationRepository.deleteNotification(notificationId);
    }
}
export default new NotificationService();
