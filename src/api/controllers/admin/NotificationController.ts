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

            if (notification.userId !== req.userdata.id) {
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

            if (notification.userId !== req.userdata.id) {
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

            if (notification.userId !== req.userdata.id) {
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
            const { target, title, message, channels, identifier, userId, ...rest } = req.body;

            // 1. Resolve Specific User by Email/Phone if identifier is provided
            let resolvedUserId = userId;
            let targetUser: any = null;
            if ((!target || target === 'specific_user') && identifier && !userId) {
                const { default: UserRepository } = await import('../../repositories/UserRepository');
                targetUser = await UserRepository.findUserByEmailOrPhone(identifier, identifier);
                if (targetUser) {
                    resolvedUserId = targetUser._id;
                } else {
                    res.status(STATUS.NOT_FOUND).json({
                        success: false,
                        message: 'User not found with that email or phone number'
                    });
                    return;
                }
            }

            // 2. Handle Broadcast Targets
            if (target && ['all', 'all_vendors', 'all_riders', 'all_customers', 'all_admins'].includes(target)) {
                const broadcastTarget = target === 'all' ? 'all' : target.replace('all_', '');
                
                await NotificationService.sendBroadcast({
                    target: broadcastTarget as any,
                    title,
                    message,
                    channels: channels || ['in_app', 'push']
                });
                
                res.status(STATUS.OK).send({
                    success: true,
                    message: `Broadcast message triggered for ${target}`
                });
                return;
            }

            // 3. Individual Creation
            if (!resolvedUserId) {
                res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Target group or Specific User Identifier is required'
                });
                return;
            }

            const created = await NotificationService.create({
                ...rest,
                userId: resolvedUserId,
                title,
                message,
                channels: channels || ['in_app', 'push']
            });

            if (!created) {
                throw Error('failed to create a notification');
            }

            res.status(STATUS.OK).send({
                success: true,
                message: targetUser ? `Notification sent to ${targetUser.firstName} ${targetUser.lastName}` : 'Notification Sent Successfully',
                data: created
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

            if (notification.userId !== req.userdata.id) {
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
            await NotificationService.markAllAsRead(req.userdata.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'All notifications marked as read'
            });
        }
    );

    deleteAll = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            await NotificationService.deleteAll(req.userdata.id);

            res.status(STATUS.OK).send({
                success: true,
                message: 'All notifications deleted successfully'
            });
        }
    );
}

export default new NotificationController();
