import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminConfigurationController from '../../../controllers/admin/AdminConfigurationController';

const configurationRouter: Router = Router();

configurationRouter.post('/', AdminConfigurationController.create);
configurationRouter.get('/', AdminConfigurationController.getSingle);
configurationRouter.patch('/states', AdminConfigurationController.addState);
configurationRouter.delete(
    '/states/:id',
    AdminConfigurationController.removeState
);

configurationRouter.patch('/cities', AdminConfigurationController.addCity);
configurationRouter.delete(
    '/cities/:id',
    AdminConfigurationController.removeCity
);

configurationRouter.patch('/fees', AdminConfigurationController.updateFees);
configurationRouter.patch(
    '/nearby',
    AdminConfigurationController.updateNearbyDistance
);
configurationRouter.patch(
    '/working-hour',
    AdminConfigurationController.updateWorkingHour
);

export default configurationRouter;
