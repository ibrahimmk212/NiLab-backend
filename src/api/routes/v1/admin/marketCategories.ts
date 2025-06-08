import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import AdminMarketCategoryController from '../../../controllers/admin/AdminMarketCategoryController';

const adminMarketCategoryRouter: Router = Router();
adminMarketCategoryRouter.post(
    '/create',
    Validate(productRequirement.createCategory),
    AdminMarketCategoryController.create
);
adminMarketCategoryRouter.put(
    '/:id',
    // Validate(productRequirement.),
    AdminMarketCategoryController.update
);
adminMarketCategoryRouter.get('/', AdminMarketCategoryController.getAll);
adminMarketCategoryRouter.put('/', AdminMarketCategoryController.update);
adminMarketCategoryRouter.post('/', AdminMarketCategoryController.create);
adminMarketCategoryRouter.get('/:id', AdminMarketCategoryController.getSingle);
export default adminMarketCategoryRouter;
