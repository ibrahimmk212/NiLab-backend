import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import NotificationController from '../../../controllers/riders/NotificationController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';

import NotificationModel from '../../../../api/models/Notification';

const riderNotificationRouter: Router = Router();

riderNotificationRouter.get(
    '/',
    advancedQuery(NotificationModel),
    NotificationController.getNotifications
);

export default riderNotificationRouter;
