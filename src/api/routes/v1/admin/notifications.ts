import { Router } from 'express';
import NotificationController from '../../../controllers/admin/NotificationController';

const customerNotificationRouter: Router = Router();

customerNotificationRouter.get('/', NotificationController.getNotifications);

customerNotificationRouter.put(
    '/read-all',
    NotificationController.markAllAsRead
);

customerNotificationRouter.delete(
    '/delete-all',
    NotificationController.deleteAll
);

customerNotificationRouter.post(
    '/',
    NotificationController.create
);

customerNotificationRouter.put(
    '/:notificationId/read',
    NotificationController.markAsRead
);

customerNotificationRouter.put(
    '/:notificationId/unread',
    NotificationController.markAsUnread
);

customerNotificationRouter.get(
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

customerNotificationRouter.put(
    '/:notificationId',
    NotificationController.update
);

export default customerNotificationRouter;
