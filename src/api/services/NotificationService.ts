/* eslint-disable @typescript-eslint/no-explicit-any */
import NotificationRepository from '../repositories/NotificationRepository';
import ProductModel, { Notification } from '../models/Notification';
import UserRepository from '../repositories/UserRepository';
import RiderService from './RiderService';
import SocketService from './SocketService';
import { sendPushNotification, sendTopicNotification, subscribeToTopic } from '../libraries/firebase';
import EmailTemplate from '../libraries/emails';

interface INotificationService {
    create(payload: any): Promise<any>;
    getAll(data: any): Promise<any[]>;
    get(Id: string): Promise<any>;
    update(Id: string, data: any): Promise<boolean>;
    delete(userId: string): Promise<boolean>;
    markAllAsRead(userId: string, vendorId?: string): Promise<any>;
    deleteAll(userId: string, vendorId?: string): Promise<any>;
}

class NotificationService implements INotificationService {
    async create(payload: any): Promise<any> {
        const { channels = ['in_app', 'push'], title, message, userId, ...rest } = payload;

        // 1. Create In-App Notification (only if in_app channel selected)
        let notification = null;
        if (channels.includes('in_app')) {
            notification = await NotificationRepository.createNotification({
                ...rest,
                userId,
                title,
                message
            });
        }

        // 2. Send Push Notification
        if (channels.includes('push')) {
            this.sendPush(userId, title, message).catch(
                (err) => console.error('Push Notification Failed:', err)
            );
        }

        // 3. Send Email Notification
        if (channels.includes('email')) {
            try {
                const user = await UserRepository.findUserById(userId);
                if (user && user.email) {
                    this.sendGenericEmail(user.email, title, message).catch(console.error);
                }
            } catch (error) {
                console.error('Failed to send individual notification email', error);
            }
        }

        // 4. Send Socket Notification (for real-time updates)
        if (notification) {
            const role = payload.role || 'customer';
            const socketPayload = {
                ...(notification.toJSON ? notification.toJSON() : notification),
                orderId: payload.orderId,
                orderCode: payload.orderCode
            };
            if (role === 'admin') {
                SocketService.emitToAdmin(userId, 'admin_notification', socketPayload);
            } else if (role === 'rider') {
                SocketService.emitToRider(payload.riderId, 'rider_notification', socketPayload);
            } else if (role === 'vendor') {
                if (payload.vendorId) {
                    SocketService.emitToVendor(payload.vendorId, 'vendor_notification', socketPayload);
                }
                SocketService.emitToUser(userId, 'vendor_notification', socketPayload);
            } else {
                SocketService.emitToUser(userId, 'customer_notification', socketPayload);
            }
        }

        return notification || { success: true };
    }

    private async sendPush(userId: string, title: string, message: string) {
        if (!userId) return;
        try {
            const user = await UserRepository.findUserById(userId);
            if (user && user.deviceToken) {
                await sendPushNotification(
                    user.deviceToken,
                    title || 'New Notification',
                    message
                );
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

    async markAllAsRead(userId: string, vendorId?: string): Promise<any> {
        return await NotificationRepository.markAllAsRead(userId, vendorId);
    }

    async deleteAll(userId: string, vendorId?: string): Promise<any> {
        return await NotificationRepository.deleteAll(userId, vendorId);
    }

    async notifyAdmins(title: string, message: string): Promise<void> {
        // Fetch all admins
        const admins = await UserRepository.findAll({
            role: 'admin',
            limit: 100
        });
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
                    role: 'rider',
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
    async notifyVendor(
        vendorId: string,
        title: string,
        message: string
    ): Promise<void> {
        try {
            // We need to find the User ID associated with this Vendor
            // Accessing VendorRepository directly or via Service.
            // To avoid circular dependency if VendorService uses NotificationService, we use Repository.
            const { default: VendorRepository } = await import(
                '../repositories/VendorRepository'
            );
            const vendor = await VendorRepository.findById(vendorId);

            if (vendor && vendor.user) {
                const userId =
                    typeof vendor.user === 'object'
                        ? (vendor.user as any)._id
                        : vendor.user;

                await this.create({
                    userId: userId,
                    vendorId: vendor._id,
                    role: 'vendor',
                    title,
                    message,
                    status: 'unread'
                });
            }
        } catch (error) {
            console.error('Failed to notify vendor:', error);
        }
    }

    // --- Broadcast (Batch Create) Methods ---

    async notifyAllVendors(title: string, message: string) {
        try {
            const { default: VendorRepository } = await import(
                '../repositories/VendorRepository'
            );
            // Fetch all vendors (with pagination handling? ideally we need ALL. Set high limit)
            // Warning: High memory usage for large datasets.
            const result = await VendorRepository.findVendorsByOption(
                {},
                10000
            ); // Limit 10000 for now

            if (result && result.vendors) {
                const notifications = [];
                for (const vendor of result.vendors) {
                    // Start process to extract User ID from Vendor
                    // Vendor object populates user? Yes, based on findVendorsByOption

                    if (vendor.user) {
                        const userId =
                            typeof vendor.user === 'object'
                                ? (vendor.user as any)._id
                                : vendor.user;

                        // Create directly to trigger socket
                        await this.create({
                            userId,
                            vendorId: vendor._id,
                            role: 'vendor',
                            title,
                            message,
                            status: 'unread'
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to notify all vendors', error);
        }
    }

    async notifyAllRiders(title: string, message: string) {
        try {
            // Assuming Riders have a similar bulk fetch
            const riders = await RiderService.findAllRiders({
                status: 'verified', // Optional: notify all or only verified? Usually all active.
                limit: 10000
            });

            if (riders && riders.data) {
                for (const rider of riders.data) {
                    await this.create({
                        userId: rider.userId,
                        riderId: rider._id,
                        role: 'rider',
                        title,
                        message,
                        status: 'unread'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to notify all riders', error);
        }
    }

    async notifyAllCustomers(title: string, message: string) {
        try {
            // Fetch all users with role 'customer'
            const result = await UserRepository.findAll({
                role: 'customer',
                limit: 10000
            });

            if (result && result.data) {
                for (const user of result.data) {
                    await this.create({
                        userId: user._id,
                        role: 'customer', // or default
                        title,
                        message,
                        status: 'unread'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to notify all customers', error);
        }
    }

    async notifyAllAdmins(title: string, message: string) {
        try {
            // Fetch all admins
            const result = await UserRepository.findAll({
                role: 'admin',
                limit: 10000
            });

            if (result && result.data) {
                for (const user of result.data) {
                    await this.create({
                        userId: user._id,
                        role: 'admin',
                        title,
                        message,
                        status: 'unread'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to notify all admins', error);
        }
    }

    async sendBroadcast(payload: {
        target: 'all' | 'vendors' | 'riders' | 'customers' | 'admins';
        title: string;
        message: string;
        channels: ('push' | 'email' | 'in_app')[];
    }) {
        const { target, title, message, channels } = payload;

        // 1. Send Push Notification via Topic (The "At Once" way)
        if (channels.includes('push')) {
            let topic: string = target;
            if (target === 'all') topic = 'all';
            else if (target === 'customers') topic = 'customer';
            else if (target === 'riders') topic = 'rider';
            
            sendTopicNotification(topic, title, message).catch(console.error);
        }

        // 2. Fetch users for In-App and Email (Still needed for these channels)
        let users: any[] = [];
        if (channels.includes('in_app') || channels.includes('email')) {
            if (target === 'all') {
                const res = await UserRepository.findAll({ limit: 50000 });
                users = res.data || [];
            } else if (target === 'vendors') {
                const { default: VendorRepository } = await import('../repositories/VendorRepository');
                const res = await VendorRepository.findVendorsByOption({}, 10000);
                users = res.vendors.map((v: any) => v.user);
            } else if (target === 'riders') {
                const riders = await RiderService.findAllRiders({ limit: 10000 });
                users = riders.data.map((r: any) => r.user);
            } else if (target === 'customers') {
                const res = await UserRepository.findAll({ role: 'customer', limit: 10000 });
                users = res.data || [];
            } else if (target === 'admins') {
                const res = await UserRepository.findAll({ role: 'admin', limit: 1000 });
                users = res.data || [];
            }
        }

        // 3. Batch Create In-App Notifications
        if (channels.includes('in_app') && users.length > 0) {
            const notifications = users.map((user) => ({
                userId: typeof user === 'object' ? user._id : user,
                title,
                message,
                status: 'unread'
            }));
            await NotificationRepository.createMany(notifications);
            
            // Emit socket to all (optional, but good for real-time)
            SocketService.broadcast('broadcast_notification', { title, message });
        }

        // 4. Send Emails (Still requires looping, but can be moved to a background job/queue)
        if (channels.includes('email') && users.length > 0) {
            for (const user of users) {
                const email = typeof user === 'object' ? user.email : null;
                if (email) {
                    this.sendGenericEmail(email, title, message).catch(console.error);
                }
            }
        }
    }

    private async sendGenericEmail(email: string, title: string, message: string) {
        await EmailTemplate.broadcast(email, {
            title,
            message
        });
    }

    async subscribeToUserTopics(deviceToken: string, role: string) {
        if (!deviceToken) return;
        
        // Only Customers and Riders use the mobile app
        if (role === 'user') {
            await subscribeToTopic(deviceToken, 'all');
            await subscribeToTopic(deviceToken, 'customer');
        } else if (role === 'rider') {
            await subscribeToTopic(deviceToken, 'all');
            await subscribeToTopic(deviceToken, 'rider');
        }
    }
}
export default new NotificationService();
