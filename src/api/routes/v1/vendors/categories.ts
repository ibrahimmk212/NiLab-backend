import { Router } from 'express';
import VendorProductCategoryController from '../../../controllers/vendors/VendorProductCategoryController';

const vendorCategoryRouter: Router = Router({ mergeParams: true });

vendorCategoryRouter.get('/:id', VendorProductCategoryController.getSingle);
vendorCategoryRouter.get('/', VendorProductCategoryController.getAll);
vendorCategoryRouter.post('/', VendorProductCategoryController.create);
vendorCategoryRouter.put('/:id', VendorProductCategoryController.update);
vendorCategoryRouter.delete('/:id', VendorProductCategoryController.delete);

export default vendorCategoryRouter;
