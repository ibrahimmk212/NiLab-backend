import { Router } from 'express';
import AdminDeliverySubscriptionController from '../../../controllers/admin/AdminDeliverySubscriptionController';

const adminDeliverySubscriptionRouter: Router = Router();

adminDeliverySubscriptionRouter.post(
    '/',
    AdminDeliverySubscriptionController.createPlan
);
adminDeliverySubscriptionRouter.get(
    '/',
    AdminDeliverySubscriptionController.getAllPlans
);
adminDeliverySubscriptionRouter.get(
    '/:id',
    AdminDeliverySubscriptionController.getPlanById
);
adminDeliverySubscriptionRouter.put(
    '/:id',
    AdminDeliverySubscriptionController.updatePlan
);
adminDeliverySubscriptionRouter.delete(
    '/:id',
    AdminDeliverySubscriptionController.deletePlan
);

export default adminDeliverySubscriptionRouter;
