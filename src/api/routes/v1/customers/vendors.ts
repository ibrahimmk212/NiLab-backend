import { Router } from 'express';
import vendorController from '../../../controllers/customers/VendorController';
import customerProductRouter from './products';

const customerVendorRouter: Router = Router({ mergeParams: true });

customerVendorRouter.get('/', vendorController.getVendors);
customerVendorRouter.get('/nearby', vendorController.getNearbyVendors);

customerVendorRouter.get('/:vendorId', vendorController.getVendorDetails);

customerVendorRouter.use('/:vendorId/products', customerProductRouter);

export default customerVendorRouter;
