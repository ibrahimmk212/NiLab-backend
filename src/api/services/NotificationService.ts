/* eslint-disable @typescript-eslint/no-explicit-any */
import NotificationRepository from '../repositories/NotificationRepository';
import ProductModel, { Notification } from '../models/Notification';
import UserRepository from '../repositories/UserRepository';
import RiderService from './RiderService';
import SocketService from './SocketService';
import { sendPushNotification } from '../libraries/firebase';

interface INotificationService {
    create(payload: any): Promise<any>;
    getAll(data: any): Promise<any[]>;
    get(Id: string): Promise<any>;
    update(Id: string, data: any): Promise<boolean>;
    delete(userId: string): Promise<boolean>;
}

class NotificationService implements INotificationService {
    async create(payload: any): Promise<any> {
        // 1. Create In-App Notification
        const notification = await NotificationRepository.createNotification(payload);

        // 2. Send Push Notification (asynchronously)
        this.sendPush(payload.userId, payload.title, payload.message).catch(err => 
            console.error('Push Notification Failed:', err)
        );

        // 3. Send Socket Notification
        let eventName = 'customer_notification';
        if (payload.vendorId) {
            eventName = 'vendor_notification';
        } else if (payload.riderId) {
            eventName = 'rider_notification';
        }

        SocketService.emitToUser(payload.userId, eventName, notification);

        return notification;
    }

    private async sendPush(userId: string, title: string, message: string) {
        if (!userId) return;
        try {
            const user = await UserRepository.findUserById(userId);
            if (user && user.deviceToken) {
                await sendPushNotification(user.deviceToken, title || 'New Notification', message);
            }
        } catch (error) {
            console.error('Error fetching user for push:', error);
        }
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

    async notifyAdmins(title: string, message: string): Promise<void> {
        // Fetch all admins
        const admins = await UserRepository.findAll({ role: 'admin', limit: 100 });
        if (admins && admins.data) {
            const notifications = admins.data.map((admin: any) => ({
                userId: admin._id,
                title,
                message,
                status: 'unread'
            }));
            // Batch create notifications? Repository currently does one by one.
            // For now, loop. To optimize, add createMany in Repository.
            for (const notif of notifications) {
                await this.create(notif);
            }
        }
    }

    async notifyRidersInState(
        state: string,
        title: string,
        message: string
    ): Promise<void> {
        try {
            const riders = await RiderService.findAllRiders({
                status: 'verified',
                state: state,
                available: true, // Only notify available riders?
                limit: 100
            });

            if (riders?.data?.length > 0) {
                const notifications = riders.data.map((rider: any) => ({
                    userId: rider.userId, // Notification links to User ID usually
                    riderId: rider._id,
                    title,
                    message,
                    status: 'unread'
                }));

                for (const notif of notifications) {
                    await this.create(notif);
                }
            }
        } catch (error) {
            console.error('Failed to notify riders:', error);
        }
    }
    async notifyVendor(vendorId: string, title: string, message: string): Promise<void> {
        try {
             // We need to find the User ID associated with this Vendor
             // Accessing VendorRepository directly or via Service. 
             // To avoid circular dependency if VendorService uses NotificationService, we use Repository.
             const { default: VendorRepository } = await import('../repositories/VendorRepository');
             const vendor = await VendorRepository.findById(vendorId);
             
             if (vendor && vendor.user) {
                 const userId = typeof vendor.user === 'object' ? (vendor.user as any)._id : vendor.user;
                 
                  await this.create({
                    userId: userId,
                    vendorId: vendor._id,
                    title,
                    message,
                    status: 'unread'
                });
             }
        } catch (error) {
            console.error('Failed to notify vendor:', error);
        }
    }
}
export default new NotificationService();
