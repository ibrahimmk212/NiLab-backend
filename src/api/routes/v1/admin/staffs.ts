import { Router } from 'express';
import AdminStaffController from '../../../controllers/admin/AdminStaffController';

const adminStaffRouter: Router = Router();

adminStaffRouter.get('/', AdminStaffController.getAll);
adminStaffRouter.get('/:id', AdminStaffController.getSingle);
adminStaffRouter.patch('/:id/status', AdminStaffController.updateStatus);
adminStaffRouter.delete('/:id', AdminStaffController.delete);

export default adminStaffRouter;
