import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import AdminVendorCategoryController from '../../../controllers/admin/AdminVendorCategoryController';

const adminVendorCategoryRouter: Router = Router();
adminVendorCategoryRouter.post(
    '/create',
    Validate(productRequirement.createCategory),
    AdminVendorCategoryController.create
);
adminVendorCategoryRouter.put(
    '/:id',
    // Validate(productRequirement.),
    AdminVendorCategoryController.update
);
adminVendorCategoryRouter.get('/', AdminVendorCategoryController.getAll);
adminVendorCategoryRouter.put('/', AdminVendorCategoryController.update);
adminVendorCategoryRouter.post('/', AdminVendorCategoryController.create);
adminVendorCategoryRouter.get('/:id', AdminVendorCategoryController.getSingle);
export default adminVendorCategoryRouter;
