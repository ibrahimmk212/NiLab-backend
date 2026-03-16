import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import VehicleTypeController from '../../../controllers/admin/AdminVehicleTypeController';

const adminVehicleTypeRouter: Router = Router();

adminVehicleTypeRouter
    .route('/')
    .get(VehicleTypeController.getAllVehicleTypes)
    .post(
        // Validate(Requirements.createOrder),
        VehicleTypeController.createVehicleType
    );

adminVehicleTypeRouter
    .route('/:id')
    .get(VehicleTypeController.getVehicleTypeById)
    .put(
        // Validate(Requirements.createOrder),
        VehicleTypeController.updateVehicleType
    )
    .delete(
        // Validate(Requirements.createOrder),
        VehicleTypeController.deleteVehicleType
    );

export default adminVehicleTypeRouter;
