import { Router } from 'express';
import CustomerMarketCategoryController from '../../../controllers/customers/MarketCategoryController';

const aminMarketCategoryRouter: Router = Router({ mergeParams: true });

aminMarketCategoryRouter.get(
    '/:id',
    CustomerMarketCategoryController.getSingle
);
aminMarketCategoryRouter.get('/', CustomerMarketCategoryController.getAll);

export default aminMarketCategoryRouter;
