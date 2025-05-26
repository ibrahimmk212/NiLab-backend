import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import AdminVendorController from '../../../controllers/admin/AdminVendorController';
import vendorRequirement from '../../../middlewares/validator/requirements/vendor';

const adminVendorRouter: Router = Router();
adminVendorRouter.post(
    '/onboard',
    Validate(vendorRequirement.onboard),
    AdminVendorController.create
);
adminVendorRouter.get('/all', AdminVendorController.getAll);
adminVendorRouter.get('/:id', AdminVendorController.getSingle);
adminVendorRouter.put(
    '/:id',
    Validate(vendorRequirement.update),
    AdminVendorController.update
);
adminVendorRouter.put(
    '/:id/status',
    Validate(vendorRequirement.updateStatus),
    AdminVendorController.update
);

export default adminVendorRouter;
