import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import VendorProductController from '../../../controllers/vendors/VendorProductController';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import ProductModel from '../../../models/Product';

const productRouter: Router = Router();
productRouter.get(
    '/',
    advancedQuery(ProductModel),
    VendorProductController.getAll
);
productRouter.get(
    '/categories',
    VendorProductController.getAllCategories
);
productRouter.get('/:id', VendorProductController.getSingle);
export default productRouter;
