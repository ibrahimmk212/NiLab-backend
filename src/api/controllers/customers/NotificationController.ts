/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import NotificationService from '../../services/NotificationService';

class NotificationController {
    getNotifications = asyncHandler(
        async (req: any, res: Response): Promise<void> => {
            const Notifications = await NotificationService.getAll({
                ...req.query,
                userId: req.userdata.id
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Notifications fetched successfully',
                ...Notifications
            });
        }
    );

    getNotificationById = asyncHandler(
        async (req: any, res: Response): Promise<void> => {
            const { notificationId } = req.params;

            const notification: any = await NotificationService.get(
                notificationId
            );

            if (notification.userId.toString() !== req.userdata.id) {
                throw Error('Unauthorized');
            }
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

            if (notification.userId.toString() !== req.userdata.id) {
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

            if (notification.userId.toString() !== req.userdata.id) {
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

    delete = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            // const { vendor, body, params } = req;
            const { notificationId } = req.params;

            const notification = await NotificationService.get(notificationId);

            if (!notification) {
                throw Error('Failed to delete status');
            }

            if (notification.userId.toString() !== req.userdata.id) {
                throw Error('Unauthorized');
            }

            await notification.deleteOne();

            res.status(STATUS.OK).send({
                success: true,
                message: 'Notification deleted Successfully'
            });
        }
    );
}

export default new NotificationController();
