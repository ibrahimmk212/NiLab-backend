import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import staffRequirement from '../../../middlewares/validator/requirements/staff';
import VendorStaffController from '../../../controllers/vendors/VendorStaffController';

const vendorStaffRouter: Router = Router();
vendorStaffRouter.post(
    '/new',
    Validate(staffRequirement.createStaff),
    VendorStaffController.create
);
vendorStaffRouter.get('/', VendorStaffController.getAll);

vendorStaffRouter.get('/:id', VendorStaffController.getSingle);
vendorStaffRouter.patch('/:id', VendorStaffController.update);
vendorStaffRouter.delete('/:id', VendorStaffController.delete);
export default vendorStaffRouter;
