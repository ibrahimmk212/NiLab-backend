import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import NotificationController from '../../../controllers/customers/NotificationController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';

import NotificationModel from '../../../../api/models/Notification';

const customerNotificationRouter: Router = Router();

customerNotificationRouter.get(
    '/',
    advancedQuery(NotificationModel),
    NotificationController.getNotifications
);

export default customerNotificationRouter;
