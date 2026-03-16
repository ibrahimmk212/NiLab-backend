import { Router } from 'express';
import VehicleTypeController from '../../../controllers/public/VehicleTypeController';

const vehicleType: Router = Router();

vehicleType.get('/', VehicleTypeController.getAll);
vehicleType.get('/:id', VehicleTypeController.getById);

export default vehicleType;
