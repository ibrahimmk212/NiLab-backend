import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import VendorOrderController from '../../../controllers/vendors/VendorOrderController';
import OrderModel from '../../../models/Order';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import orderRequirement from '../../../middlewares/validator/requirements/orders';

const vendorOrderRouter: Router = Router();
vendorOrderRouter.get(
    '/',
    advancedQuery(OrderModel),
    VendorOrderController.getAll
);

vendorOrderRouter.get('/recent/all', VendorOrderController.getRecent);
vendorOrderRouter.get('/:id', VendorOrderController.getSingle);
// vendorOrderRouter.put(
//     '/:id',
//     Validate(productRequirement.update),
//     VendorOrderController.update
// );
vendorOrderRouter.put(
    '/:id/status',
    Validate(orderRequirement.updateStatus),
    VendorOrderController.updateStatus
);
// vendorOrderRouter.put('/:id/cancel', VendorOrderController.cancel);
export default vendorOrderRouter;
