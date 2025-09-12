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

const vendorsRouter: Router = Router();
vendorsRouter.post('/login', VendorInfoController.login);

vendorsRouter.use(auth.isVendor);

vendorsRouter.get('/', VendorInfoController.currentUser);
vendorsRouter.get('/dashboard', VendorInfoController.dashboard);

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

vendorsRouter.put('/banner', VendorInfoController.uploadBanner);

vendorsRouter.use('/products', vendorProductRouter);
vendorsRouter.use('/orders', vendorOrderRouter);
vendorsRouter.use('/staffs', vendorStaffRouter);
vendorsRouter.use('/wallet', vendorWalletRouter);
vendorsRouter.use('/transactions', vendorTransactionRouter);
vendorsRouter.use('/market-categories', customerMarketCategoryRouter);
vendorsRouter.use('/categories', vendorCategoryRouter);

export default vendorsRouter;
