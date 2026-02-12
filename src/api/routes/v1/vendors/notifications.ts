import { Router } from 'express';
import NotificationController from '../../../controllers/vendors/NotificationController';

const vendorNotificationRouter: Router = Router();

vendorNotificationRouter.get('/', NotificationController.getNotifications);
vendorNotificationRouter.put(
    '/:notificationId/read',
    NotificationController.markAsRead
);
vendorNotificationRouter.put(
    '/:notificationId/unread',
    NotificationController.markAsUnread
);
vendorNotificationRouter.get(
    '/:notificationId',
    NotificationController.getNotificationById
);

vendorNotificationRouter.delete(
    '/:notificationId',
    NotificationController.delete
);

vendorNotificationRouter.put(
    '/read-all/update',
    NotificationController.markAllAsRead
);

vendorNotificationRouter.delete(
    '/data/delete-all',
    NotificationController.deleteAll
);

export default vendorNotificationRouter;
