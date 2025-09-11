import { Router } from 'express';
import MarketCategoryController from '../../../controllers/vendors/MarketCategoryController';

const marketCategoryRouter: Router = Router();
marketCategoryRouter.get('/', MarketCategoryController.getAll);
marketCategoryRouter.get('/:id', MarketCategoryController.getSingle);
// marketCategoryRouter.put('/:id', MarketCategoryController)

export default marketCategoryRouter;
