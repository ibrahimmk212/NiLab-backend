import { Router } from 'express';
import AdminDashboardController from '../../../controllers/admin/AdminDashboardController';

const adminDashboardRouter = Router();

adminDashboardRouter.get(
    '/stats',
    AdminDashboardController.adminDashboardStats
);

export default adminDashboardRouter;
