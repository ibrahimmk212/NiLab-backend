
import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import VendorCategoryController from '../../../controllers/vendors/VendorCategoryController';


const vendorCategoryRouter: Router = Router();
vendorCategoryRouter.get('/', VendorCategoryController.getAll)
vendorCategoryRouter.get('/:id', VendorCategoryController.getSingle)
// vendorCategoryRouter.put('/:id', VendorCategoryController)

export default vendorCategoryRouter;
