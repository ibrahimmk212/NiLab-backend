import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import VehicleTypeController from '../../../controllers/customers/VehicleTypeController';

const customerOrderRouter: Router = Router();

customerOrderRouter.get(
    '/delivery-vehicle-types',
    VehicleTypeController.getDeliveryVehicleTypes
);
customerOrderRouter.get(
    '/delivery-vehicle-types/:vehicleTypeId',
    VehicleTypeController.getVehicleTypeById
);

export default customerOrderRouter;
