import { Router } from 'express';
import NotificationController from '../../../controllers/admin/NotificationController';

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

customerNotificationRouter.delete(
    '/:notificationId',
    NotificationController.delete
);

customerNotificationRouter.put(
    '/:notificationId',
    NotificationController.update
);

customerNotificationRouter.post(
    '/:notificationId',
    NotificationController.create
);

export default customerNotificationRouter;
