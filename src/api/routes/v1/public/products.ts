import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import ProductController from '../../../controllers/public/ProductController';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import ProductModel from '../../../models/Product';

const productRouter: Router = Router();
productRouter.get('/', ProductController.getAll);
productRouter.get('/categories', ProductController.getAllCategories);
productRouter.get('/:id', ProductController.getSingle);
export default productRouter;
