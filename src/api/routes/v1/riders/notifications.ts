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

customerNotificationRouter.put(
    '/read-all/update',
    NotificationController.markAllAsRead
);

customerNotificationRouter.delete(
    '/data/delete-all',
    NotificationController.deleteAll
);

customerNotificationRouter.delete(
    '/:notificationId',
    NotificationController.delete
);

export default customerNotificationRouter;
