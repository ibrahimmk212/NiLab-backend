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
import AdminUserController from '../../../controllers/admin/AdminUserController';
import AdminMainController from '../../../controllers/admin/AdminMainController';
import adminRouter from './admins';
import adminPromotionRouter from './promotions';
import adminKycRouter from './kyc';
import adminMarketCategoryRouter from './marketCategories';

const adminsRouter: Router = Router();

adminsRouter.get('/', AdminMainController.currentUser);
adminsRouter.use('/users', usersRouter);
adminsRouter.use('/admins', adminRouter);
adminsRouter.use('/vendors', adminVendorRouter);
adminsRouter.use('/market-categories', adminMarketCategoryRouter);
adminsRouter.use('/orders', adminOrderRouter);
adminsRouter.use('/riders', adminRidersRouter);
adminsRouter.use('/dispatches', adminDispatchRouter);
adminsRouter.use('/collections', collectionRouter);
adminsRouter.use('/categories', adminCategoryRouter);
adminsRouter.use('/configurations', configurationRouter);
adminsRouter.use('/notifications', adminNotificationRouter);
adminsRouter.use('/transactions', adminTransactionRouter);
adminsRouter.use('/promotions', adminPromotionRouter);
adminsRouter.use('/kyc', adminKycRouter);

adminsRouter.post('/login', AdminUserController.login);
adminsRouter.get('/dashboard', AdminMainController.dashboard);

export default adminsRouter;
