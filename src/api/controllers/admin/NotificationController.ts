/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import NotificationService from '../../services/NotificationService';

class NotificationController {
    getNotifications = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const Notifications = await NotificationService.getAll(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Notifications fetched successfully',
                ...Notifications
            });
        }
    );

    getNotificationById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { notificationId } = req.params;

            const notification: any = await NotificationService.get(
                notificationId
            );
            res.status(STATUS.OK).json({
                success: true,
                data: notification
            });
        }
    );
    markAsRead = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            // const { vendor, body, params } = req;
            const { notificationId } = req.params;

            const notification = await NotificationService.get(notificationId);

            if (!notification) {
                throw Error('Failed to update status');
            }

            if (notification.userId !== req.user.id) {
                throw Error('Unauthorized');
            }

            notification.status = 'read';
            await notification?.save();

            res.status(STATUS.OK).send({
                success: true,
                message: 'Notification Updated Successfully',
                data: notification
            });
        }
    );

    markAsUnread = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            // const { vendor, body, params } = req;
            const { notificationId } = req.params;

            const notification = await NotificationService.get(notificationId);

            if (!notification) {
                throw Error('Failed to update status');
            }

            if (notification.userId !== req.user.id) {
                throw Error('Unauthorized');
            }

            notification.status = 'unread';
            await notification?.save();

            res.status(STATUS.OK).send({
                success: true,
                message: 'Notification Updated Successfully',
                data: notification
            });
        }
    );

    update = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            // const { vendor, body, params } = req;
            const { notificationId } = req.params;

            const notification = await NotificationService.get(notificationId);

            if (!notification) {
                throw Error('Failed to update status');
            }

            if (notification.userId !== req.user.id) {
                throw Error('Unauthorized');
            }

            const update = NotificationService.update(notificationId, req.body);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Notification Updated Successfully',
                data: notification
            });
        }
    );

    create = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const { target, title, message, ...rest } = req.body;
            
            // Handle Bulk Targets
            if (target === 'all_vendors') {
                await NotificationService.notifyAllVendors(title, message);
            } else if (target === 'all_riders') {
                await NotificationService.notifyAllRiders(title, message);
            } else if (target === 'all_customers') {
                await NotificationService.notifyAllCustomers(title, message);
            } else if (target === 'all_admins') {
                await NotificationService.notifyAllAdmins(title, message);
            } else {
                // Individual Creation
                const created = await NotificationService.create(req.body);
                if (!created) {
                    throw Error('failed to create a notification');
                }
                res.status(STATUS.OK).send({
                    success: true,
                    message: 'Notification Created Successfully',
                    data: created
                });
                return;
            }

            res.status(STATUS.OK).send({
                success: true,
                message: `Bulk Notification triggered for ${target}`
            });
        }
    );

    delete = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            // const { vendor, body, params } = req;
            const { notificationId } = req.params;

            const notification = await NotificationService.get(notificationId);

            if (!notification) {
                throw Error('Failed to delete status');
            }

            if (notification.userId !== req.user.id) {
                throw Error('Unauthorized');
            }

            await notification.deleteOne();

            res.status(STATUS.OK).send({
                success: true,
                message: 'Notification deleted Successfully'
            });
        }
    );

    markAllAsRead = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            await NotificationService.markAllAsRead(req.user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'All notifications marked as read'
            });
        }
    );

    deleteAll = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            await NotificationService.deleteAll(req.user.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'All notifications deleted successfully'
            });
        }
    );
}

export default new NotificationController();
