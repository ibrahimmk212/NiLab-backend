import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import ProductController from '../../../controllers/customers/ProductController';

const customerProductRouter: Router = Router({ mergeParams: true });

customerProductRouter.get('/', ProductController.getProducts);
customerProductRouter.get('/search', ProductController.search);

export default customerProductRouter;
