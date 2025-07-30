import { Router } from 'express';
import CustomerMarketCategoryController from '../../../controllers/customers/MarketCategoryController';

const customerMarketCategoryRouter: Router = Router({ mergeParams: true });

customerMarketCategoryRouter.get(
    '/:id',
    CustomerMarketCategoryController.getSingle
);
customerMarketCategoryRouter.get('/', CustomerMarketCategoryController.getAll);

export default customerMarketCategoryRouter;
