import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import customerProductRouter from './products';
import customerVendorRouter from './vendors';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import CategoryModel from '../../../models/Category';
import CategoryController from '../../../controllers/customers/CategoryController';

const customerCategoryRouter: Router = Router();

customerCategoryRouter.get(
    '/',
    advancedQuery(CategoryModel),
    CategoryController.getCategories
);

customerCategoryRouter.use('/:categoryId/vendors', customerVendorRouter);

customerCategoryRouter.use('/:categoryId/products', customerProductRouter);

export default customerCategoryRouter;
