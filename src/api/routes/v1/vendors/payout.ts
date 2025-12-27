import { Router } from 'express';
// import { Validate } from '../../../middlewares/validator';
import VendorPayoutController from '../../../controllers/vendors/PayoutController';
// import orderRequirement from '../../../middlewares/validator/requirements/orders';

const vendorPayoutRouter: Router = Router();
vendorPayoutRouter.get('/', VendorPayoutController.getAllPayouts);
vendorPayoutRouter.get('/:payoutId', VendorPayoutController.getPayout);
vendorPayoutRouter.post(
    '/request',
    // Validate(orderRequirement.updateStatus),
    VendorPayoutController.requestPayout
);
export default vendorPayoutRouter;
