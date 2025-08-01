import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import AdminCategoryController from '../../../controllers/admin/AdminCategoryController';

const adminCategoryRouter: Router = Router();
adminCategoryRouter.post(
    '/create',
    Validate(productRequirement.createCategory),
    AdminCategoryController.create
);
adminCategoryRouter.get('/all', AdminCategoryController.getAll);
adminCategoryRouter.get('/:id', AdminCategoryController.getSingle);
adminCategoryRouter.put('/:id', AdminCategoryController.update);

export default adminCategoryRouter;
