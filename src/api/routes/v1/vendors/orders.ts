import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import VendorOrderController from '../../../controllers/vendors/VendorOrderController';
import OrderModel from '../../../models/Order';
import advancedQuery from '../../../middlewares/data/advancedQuery';

const vendorOrderRouter: Router = Router();
vendorOrderRouter.get(
    '/',
    advancedQuery(OrderModel),
    VendorOrderController.getAll
);

vendorOrderRouter.get('/:id', VendorOrderController.getSingle);
vendorOrderRouter.put(
    '/:id',
    Validate(productRequirement.update),
    VendorOrderController.update
);
vendorOrderRouter.put(
    '/:id/status',
    Validate(productRequirement.updateStatus),
    VendorOrderController.updateStatus
);
// vendorOrderRouter.put('/:id/cancel', VendorOrderController.cancel);
export default vendorOrderRouter;
