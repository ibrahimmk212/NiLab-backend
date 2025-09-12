import { Router } from 'express';
import VendorCategoryController from '../../../controllers/customers/CategoryController';

const vendorCategoryRouter: Router = Router({ mergeParams: true });

vendorCategoryRouter.get('/:id', VendorCategoryController.getSingle);
vendorCategoryRouter.get('/', VendorCategoryController.getAll);

export default vendorCategoryRouter;
