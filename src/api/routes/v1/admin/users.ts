import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminUserController from '../../../controllers/admin/AdminUserController';

const adminUserRouter: Router = Router();

adminUserRouter.get('/', AdminUserController.getUsers);
adminUserRouter.get('/:id', AdminUserController.getUserDetail);
adminUserRouter.put('/:id', AdminUserController.updateUser);
adminUserRouter.put('/:id/ban', AdminUserController.banUser);
adminUserRouter.put('/:id/unban', AdminUserController.unbanUser);

export default adminUserRouter;
