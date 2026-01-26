import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import productRequirement from '../../../middlewares/validator/requirements/product';
import AdminDeliveryController from '../../../controllers/admin/AdminDeliveryController';

const adminDeliveryRouter: Router = Router();

adminDeliveryRouter.get('/', AdminDeliveryController.getAll);
adminDeliveryRouter.get('/:id', AdminDeliveryController.getSingle);

export default adminDeliveryRouter;
