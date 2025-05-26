import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import vendorController from '../../../controllers/customers/VendorController';
import customerProductRouter from './products';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import VendorModel from '../../../../api/models/Vendor';
import VendorProductController from '../../../controllers/vendors/VendorProductController';

const customerVendorRouter: Router = Router({ mergeParams: true });

customerVendorRouter.get(
    '/',
    advancedQuery(VendorModel, 'categories'),
    vendorController.getVendors
);
customerVendorRouter.get('/nearby', vendorController.getNearbyVendors);
customerVendorRouter.get('/:vendorId', vendorController.getVendorDetails);
customerVendorRouter.get(
    '/:categoryId/category',
    vendorController.getVendorsByCategory
);
customerVendorRouter.use('/:vendorId/products', customerProductRouter);
customerVendorRouter.use('/:vendorId/products/search', VendorProductController.search);


export default customerVendorRouter;
