import { Router } from 'express';
import VendorDashboardController from '../../../controllers/vendors/VendorDashboardController';

const vendorDashboardRouter = Router();

vendorDashboardRouter.get(
    '/',
    VendorDashboardController.getVendorDashboardData
);

vendorDashboardRouter.patch(
    '/toggle-status',
    VendorDashboardController.toggleStoreStatus
);
export default vendorDashboardRouter;
