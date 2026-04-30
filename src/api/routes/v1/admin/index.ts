import { Router } from 'express';
import auth from '../../../middlewares/auth';
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
import adminCustomersRouter from './customers';
import adminWalletRouter from './wallets';
import adminPayoutRouter from './payout';
import adminDashboardRouter from './dashboard';
import adminDeliveryRouter from './delivery';
import adminBannerRouter from './banners';
import adminVehicleTypeRouter from './vehicleType';
import adminStaffRouter from './staffs';
import adminLogRouter from './logs';
import adminDeliverySubscriptionRouter from './delivery-subscriptions';

const adminsRouter: Router = Router();

// --- Generalized Routes (Open to all authenticated admins) ---
adminsRouter.get('/', AdminMainController.currentUser);
adminsRouter.post('/login', AdminUserController.login);
adminsRouter.use('/users', usersRouter);
adminsRouter.use('/customers', adminCustomersRouter);
adminsRouter.use('/dashboard', adminDashboardRouter);
adminsRouter.use('/notifications', adminNotificationRouter);

// --- Protected Routes: manage_vendors ---
adminsRouter.use('/vendors', auth.checkPermissions('manage_vendors'), adminVendorRouter);
adminsRouter.use('/market-categories', auth.checkPermissions('manage_vendors'), adminMarketCategoryRouter);

// --- Protected Routes: manage_orders ---
adminsRouter.use('/orders', auth.checkPermissions('manage_orders'), adminOrderRouter);
adminsRouter.use('/transactions', auth.checkPermissions('manage_orders'), adminTransactionRouter);

// --- Protected Routes: manage_finance ---
adminsRouter.use('/wallets', auth.checkPermissions('manage_finance'), adminWalletRouter);
adminsRouter.use('/payouts', auth.checkPermissions('manage_finance'), adminPayoutRouter);

// --- Protected Routes: manage_kyc ---
adminsRouter.use('/kyc', auth.checkPermissions('manage_kyc'), adminKycRouter);

// --- Protected Routes: manage_riders ---
adminsRouter.use('/riders', auth.checkPermissions('manage_riders'), adminRidersRouter);
adminsRouter.use('/dispatches', auth.checkPermissions('manage_riders'), adminDispatchRouter);
adminsRouter.use('/vehicle-types', auth.checkPermissions('manage_riders'), adminVehicleTypeRouter);
adminsRouter.use('/delivery', auth.checkPermissions('manage_riders'), adminDeliveryRouter);
adminsRouter.use('/delivery-subscriptions', auth.checkPermissions('manage_riders'), adminDeliverySubscriptionRouter);

// --- Protected Routes: manage_settings ---
adminsRouter.use('/admins', auth.checkPermissions('manage_admins'), adminRouter);
adminsRouter.use('/categories', auth.checkPermissions('manage_categories'), adminCategoryRouter);
adminsRouter.use('/configurations', auth.checkPermissions('manage_configurations'), configurationRouter);
adminsRouter.use('/banners', auth.checkPermissions('manage_banners'), adminBannerRouter);
adminsRouter.use('/logs', auth.checkPermissions('manage_logs'), adminLogRouter);
adminsRouter.use('/staffs', auth.checkPermissions('manage_staffs'), adminStaffRouter);
adminsRouter.use('/collections', auth.checkPermissions('manage_collections'), collectionRouter);
adminsRouter.use('/promotions', auth.checkPermissions('manage_promotions'), adminPromotionRouter);

export default adminsRouter;
