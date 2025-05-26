import { Router } from 'express';
import vendorProductRouter from './products';
import vendorOrderRouter from './orders';
import vendorStaffRouter from './staffs';
import { Validate } from '../../../middlewares/validator';
import VendorInfoController from '../../../controllers/vendors/VendorInfoController';
import vendorRequirement from '../../../middlewares/validator/requirements/vendor';
import vendorWalletRouter from './wallet';
import vendorSubcategoryRouter from './subcategories';
import vendorCategoryRouter from './categories';

const vendorsRouter: Router = Router();
vendorsRouter.get('/', VendorInfoController.get);
// vendorsRouter.get('/wallet', VendorInfoController.getWallet);

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
vendorsRouter.use('/subcategories', vendorSubcategoryRouter);
vendorsRouter.use('/categories', vendorCategoryRouter);
vendorsRouter.use('/orders', vendorOrderRouter);
vendorsRouter.use('/staffs', vendorStaffRouter);
vendorsRouter.use('/wallet', vendorWalletRouter);
export default vendorsRouter;
