import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import AdminTransactionController from '../../../controllers/admin/AdminTransactionController';

const adminTransactionRouter: Router = Router();

adminTransactionRouter.get('/', AdminTransactionController.getAll);
adminTransactionRouter.get('/:id', AdminTransactionController.getSingle);

adminTransactionRouter.put(
    '/:id/status',
    AdminTransactionController.updateStatus
);

export default adminTransactionRouter;
