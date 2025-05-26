import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import AdminOrderController from '../../../controllers/admin/AdminOrderController';
import orderRequirement from '../../../middlewares/validator/requirements/orders';
import advancedQuery from '../../../middlewares/data/advancedQuery';
import OrderModel from '../../../models/Order';

const adminOrderRouter: Router = Router();
adminOrderRouter.get(
    '/',
    // advancedQuery(OrderModel),
    AdminOrderController.getAll
);
adminOrderRouter.get('/vendor/:id', AdminOrderController.getByVendor);
adminOrderRouter.get('/:id', AdminOrderController.getSingle);
adminOrderRouter.put(
    '/:id/status',
    Validate(orderRequirement.updateStatus),
    AdminOrderController.updateStatus
);
adminOrderRouter.put('/:id', AdminOrderController.updateStatus);
export default adminOrderRouter;
