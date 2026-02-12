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
    markAllAsRead(userId: string): Promise<any>;
    deleteAll(userId: string): Promise<any>;
}

class NotificationService implements INotificationService {
    async create(payload: any): Promise<any> {
        // 1. Create In-App Notification
        const notification = await NotificationRepository.createNotification(
            payload
        );

        // 2. Send Push Notification (asynchronously)
        this.sendPush(payload.userId, payload.title, payload.message).catch(
            (err) => console.error('Push Notification Failed:', err)
        );

        // 3. Send Socket Notification
        if (payload.role === 'admin') {
            SocketService.emitToAdmin(
                payload.userId,
                'admin_notification',
                notification
            );
        } else if (payload.role === 'rider') {
            SocketService.emitToRider(
                payload.riderId,
                'rider_notification',
                notification
            );
        } else if (payload.role === 'vendor') {
          const scc =  SocketService.emitToVendor(
                payload.vendorId,
                'vendor_notification',
                notification
            );
            console.log('Socket Notification Sent:', notification, scc);
        } else {
            SocketService.emitToUser(
                payload.userId,
                'customer_notification',
                notification
            );
        }

        return notification;
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

    async markAllAsRead(userId: string): Promise<any> {
        return await NotificationRepository.markAllAsRead(userId);
    }

    async deleteAll(userId: string): Promise<any> {
        return await NotificationRepository.deleteAll(userId);
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
            const { default: VendorRepository } = await import('../repositories/VendorRepository');
            // Fetch all vendors (with pagination handling? ideally we need ALL. Set high limit)
            // Warning: High memory usage for large datasets.
            const result = await VendorRepository.findVendorsByOption({}, 10000); // Limit 10000 for now
            
            if (result && result.vendors) {
                const notifications = [];
                for (const vendor of result.vendors) {
                    // Start process to extract User ID from Vendor
                    // Vendor object populates user? Yes, based on findVendorsByOption
                    
                    if (vendor.user) {
                         const userId = typeof vendor.user === 'object' ? (vendor.user as any)._id : vendor.user;
                         
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
            console.error("Failed to notify all vendors", error);
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
             console.error("Failed to notify all riders", error);
         }
    }

    async notifyAllCustomers(title: string, message: string) {
        try {
            // Fetch all users with role 'customer'
            const result = await UserRepository.findAll({ role: 'customer', limit: 10000 });
            
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
             console.error("Failed to notify all customers", error);
        }
    }

    async notifyAllAdmins(title: string, message: string) {
        try {
            // Fetch all admins
            const result = await UserRepository.findAll({ role: 'admin', limit: 10000 });
            
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
             console.error("Failed to notify all admins", error);
        }
    }


}
export default new NotificationService();
