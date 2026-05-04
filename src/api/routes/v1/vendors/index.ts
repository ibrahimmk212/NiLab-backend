import { Router } from 'express';
import vendorProductRouter from './products';
import vendorOrderRouter from './orders';
import vendorStaffRouter from './staffs';
import { Validate } from '../../../middlewares/validator';
import VendorInfoController from '../../../controllers/vendors/VendorInfoController';
import vendorRequirement from '../../../middlewares/validator/requirements/vendor';
import vendorWalletRouter from './wallet';
import auth from '../../../middlewares/auth';
import vendorTransactionRouter from './transactions';
import customerMarketCategoryRouter from './marketCategory';
import vendorCategoryRouter from './categories';
import vendorNotificationRouter from './notifications';
import VendorDashboardRouter from './dashboard';
import vendorPayoutRouter from './payout';
import vendorKycRouter from './kyc';
import { upload } from '../../../services/FileService';

const vendorsRouter: Router = Router();
vendorsRouter.post('/login', VendorInfoController.login);

vendorsRouter.use(auth.isVendor);

vendorsRouter.get('/', VendorInfoController.currentUser);
vendorsRouter.get('/dashboard/sum', VendorInfoController.dashboard);

vendorsRouter.put(
    '/',
    Validate(vendorRequirement.update),
    VendorInfoController.update
);

vendorsRouter.put(
    '/bank',
    Validate(vendorRequirement.updateBank),
    VendorInfoController.updateBank
);

vendorsRouter.put(
    '/location',
    // Validate(vendorRequirement.updateBank),
    VendorInfoController.updateLocation
);

vendorsRouter.put('/banner', upload.single('file'), VendorInfoController.uploadBanner);

vendorsRouter.use('/products', auth.checkPermissions('manage_inventory'), vendorProductRouter);
vendorsRouter.use('/orders', auth.checkPermissions('manage_orders'), vendorOrderRouter);
vendorsRouter.use('/staffs', auth.checkPermissions('manage_staff'), vendorStaffRouter);
vendorsRouter.use('/wallet', auth.checkPermissions('manage_finance'), vendorWalletRouter);
vendorsRouter.use('/transactions', auth.checkPermissions('manage_finance'), vendorTransactionRouter);
vendorsRouter.use('/notifications', vendorNotificationRouter);
vendorsRouter.use('/market-categories', customerMarketCategoryRouter);
vendorsRouter.use('/categories', auth.checkPermissions('manage_inventory'), vendorCategoryRouter);
vendorsRouter.use('/dashboard', auth.checkPermissions('view_analytics'), VendorDashboardRouter);
vendorsRouter.use('/payouts', auth.checkPermissions('manage_finance'), vendorPayoutRouter);
vendorsRouter.use('/kyc', vendorKycRouter);

export default vendorsRouter;
