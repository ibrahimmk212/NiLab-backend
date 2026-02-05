import { Router } from 'express';
import AdminDashboardController from '../../../controllers/admin/AdminDashboardController';

const adminDashboardRouter = Router();

adminDashboardRouter.get('/stats', AdminDashboardController.getStats);
adminDashboardRouter.get('/charts', AdminDashboardController.getCharts);
adminDashboardRouter.get('/recent-orders', AdminDashboardController.getRecentOrders);
adminDashboardRouter.get('/top-vendors', AdminDashboardController.getTopVendors);
adminDashboardRouter.get('/vendor-applications', AdminDashboardController.getVendorApplications);

export default adminDashboardRouter;
