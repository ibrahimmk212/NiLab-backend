import { Router } from 'express';
import usersRouter from './users';
import adminCategoryRouter from './categories';
import adminVendorRouter from './vendors';
import adminRidersRouter from './riders';
import adminDispatchRouter from './dispatches';
import collectionRouter from './collections';
import configurationRouter from './configurations';
import adminNotificationRouter from './notifications';
import adminTransactionRouter from './transactions';
import adminOrderRouter from './orders';
import adminWaitlistRouter from './waitlist';

const adminsRouter: Router = Router();

adminsRouter.use('/users', usersRouter);
adminsRouter.use('/admins', adminCategoryRouter);
adminsRouter.use('/vendors', adminVendorRouter);
adminsRouter.use('/orders', adminOrderRouter);
adminsRouter.use('/riders', adminRidersRouter);
adminsRouter.use('/dispatches', adminDispatchRouter);
adminsRouter.use('/collections', collectionRouter);
adminsRouter.use('/categories', adminCategoryRouter);
adminsRouter.use('/configurations', configurationRouter);
adminsRouter.use('/notifications', adminNotificationRouter);
adminsRouter.use('/transactions', adminTransactionRouter);
adminsRouter.use('/waitlists', adminWaitlistRouter);

export default adminsRouter;
