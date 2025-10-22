import { Router } from 'express';
import NotificationController from '../../../controllers/riders/NotificationController';

const customerNotificationRouter: Router = Router();

customerNotificationRouter.get('/', NotificationController.getNotifications);
customerNotificationRouter.put(
    '/:notificationId/read',
    NotificationController.markAsRead
);
customerNotificationRouter.put(
    '/:notificationId/unread',
    NotificationController.markAsUnread
);
customerNotificationRouter.put(
    '/:notificationId',
    NotificationController.getNotificationById
);

export default customerNotificationRouter;
