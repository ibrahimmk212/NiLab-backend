import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import VendorSubcategoryController from '../../../controllers/vendors/VendorSubcategoryController';


const vendorSubcategoryRouter: Router = Router();
vendorSubcategoryRouter.get('/', VendorSubcategoryController.getAll)
vendorSubcategoryRouter.get('/:id', VendorSubcategoryController.getSingle)
vendorSubcategoryRouter.post('/', VendorSubcategoryController.create)
// vendorSubcategoryRouter.put('/:id', VendorSubcategoryController)

export default vendorSubcategoryRouter;
