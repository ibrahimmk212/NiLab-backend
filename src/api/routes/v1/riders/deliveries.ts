import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import deliveryController from '../../../controllers/riders/DeliveryController';

const riderDeliveryRouter: Router = Router();

riderDeliveryRouter.get('/histories', deliveryController.getMyDeliveries);
riderDeliveryRouter.get('/active', deliveryController.getActiveDeliveries);
riderDeliveryRouter.get('/available', deliveryController.availableDeliveries);
riderDeliveryRouter.post(
    '/accept/:deliveryId',
    deliveryController.acceptDelivery
);
// riderDeliveryRouter.get('route/:deliveryId');

riderDeliveryRouter.get('/:deliveryId', deliveryController.getDeliveryById);
riderDeliveryRouter.put(
    '/update-status/:deliveryId',
    deliveryController.updateDeliveryStatus
);
riderDeliveryRouter.post(
    '/confirm/:deliveryId',
    deliveryController.confirmDelivery
);

riderDeliveryRouter.post(
    '/:deliveryId/accept-cash',
    deliveryController.acceptCash
);

export default riderDeliveryRouter;
