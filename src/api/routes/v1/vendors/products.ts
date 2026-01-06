import { Router } from 'express';
import { Validate } from '../../../middlewares/validator';
import VendorProductController from '../../../controllers/vendors/VendorProductController';
import productRequirement from '../../../middlewares/validator/requirements/product';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import ProductModel from '../../../models/Product';
import auth from '../../../middlewares/auth';

const vendorProductRouter: Router = Router();

vendorProductRouter.use(auth.vendorLocationIsSet);
// vendorProductRouter.put('/:id/upload-file', VendorProductController.upload);
vendorProductRouter.post(
    '/create',
    Validate(productRequirement.create),
    VendorProductController.create
);
// vendorProductRouter.post(
//     '/create-category',
//     Validate(productRequirement.createCategory),
//     VendorProductController.createCategory
// );
vendorProductRouter.get(
    '/',
    advancedQuery(ProductModel),
    VendorProductController.getAll
);
vendorProductRouter.get(
    '/categories',
    VendorProductController.getAllCategories
);
vendorProductRouter.get('/:id', VendorProductController.getSingle);
vendorProductRouter.put(
    '/:id',
    Validate(productRequirement.update),
    VendorProductController.update
);
vendorProductRouter.put(
    '/:id/status',
    // Validate(productRequirement.updateStatus),
    VendorProductController.updateAvailability
);
vendorProductRouter.delete('/:id', VendorProductController.delete);

export default vendorProductRouter;
