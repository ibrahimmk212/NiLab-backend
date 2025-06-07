import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import AdminVendorCategoryController from '../../../controllers/admin/AdminVendorCategoryController';

const adminCategoryRouter: Router = Router();
adminCategoryRouter.post(
    '/create',
    Validate(productRequirement.createCategory),
    AdminVendorCategoryController.create
);
adminCategoryRouter.put(
    '/:id',
    // Validate(productRequirement.),
    AdminVendorCategoryController.update
);
adminCategoryRouter.get('/all', AdminVendorCategoryController.getAll);
adminCategoryRouter.get('/:id', AdminVendorCategoryController.getSingle);
export default adminCategoryRouter;
