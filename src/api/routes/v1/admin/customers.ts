import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminRiderController from '../../../controllers/admin/AdminRiderController';
import ridersRequirement from '../../../middlewares/validator/requirements/riders';

const adminRidersRouter: Router = Router();

adminRidersRouter.get('/all', AdminRiderController.getAll);
adminRidersRouter.get('/:id', AdminRiderController.getSingle);

adminRidersRouter.put('/:id/status', AdminRiderController.updateStatus);

export default adminRidersRouter;
