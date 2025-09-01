import { Router } from 'express';
import DashboardController from '../../controllers/DashboardController';
import auth from '../../middlewares/auth';

const dashboardRouter = Router();

dashboardRouter.get('/admin', auth.isAdmin, DashboardController.adminDashboard);
dashboardRouter.get(
    '/vendor',
    auth.isVendor,
    DashboardController.vendorDashboard
);
dashboardRouter.get(
    '/vendor/sales',
    auth.isVendor,
    DashboardController.vendorSalesReport
);
dashboardRouter.get('/rider', auth.isRider, DashboardController.riderDashboard);
// dashboardRouter.get(
//     '/sales',
//     // auth.isAdmin,
//     // auth.isVendor,
//     DashboardController.salesReport
// );

export default dashboardRouter;
