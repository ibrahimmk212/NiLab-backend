import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminCustomerController from '../../../controllers/admin/AdminCustomerController';
import ridersRequirement from '../../../middlewares/validator/requirements/riders';

const adminCustomersRouter: Router = Router();

adminCustomersRouter.get('/all', AdminCustomerController.getCustomers);
adminCustomersRouter.get('/:id', AdminCustomerController.getCustomerDetail);
// adminCustomersRouter.get('/:id', AdminCustomerController.getSingle);

// adminCustomersRouter.put('/:id/status', AdminCustomerController.updateStatus);

export default adminCustomersRouter;
