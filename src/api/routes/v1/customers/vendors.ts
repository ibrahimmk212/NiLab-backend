import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import vendorController from '../../../controllers/customers/VendorController';
import customerProductRouter from './products';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import VendorModel from '../../../../api/models/Vendor';

const customerVendorRouter: Router = Router({ mergeParams: true });

customerVendorRouter.get(
    '/',
    // advancedQuery(VendorModel, 'marketCategoryId'),
    vendorController.getVendors
);
customerVendorRouter.get('/nearby', vendorController.getNearbyVendors);

customerVendorRouter.get('/:vendorId', vendorController.getVendorDetails);

customerVendorRouter.use('/:vendorId/products', customerProductRouter);

export default customerVendorRouter;
