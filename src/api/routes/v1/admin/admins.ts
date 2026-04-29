import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminMainController from '../../../controllers/admin/AdminMainController';

const adminRouter: Router = Router();
adminRouter.use(Auth.isAdmin);

adminRouter.post('/', AdminMainController.create);
adminRouter.get('/', AdminMainController.getAll);
adminRouter.get('/:id', AdminMainController.getSingle);
adminRouter.put('/:id', AdminMainController.update);
adminRouter.put('/:id/status', AdminMainController.updateStatus);

export default adminRouter;
