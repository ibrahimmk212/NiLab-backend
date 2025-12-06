import { Router } from 'express';
import VendorDashboardController from '../../../controllers/vendors/VendorDashboardController';

const vendorDashboardRouter: Router = Router();

vendorDashboardRouter.get(
    '/summary',
    VendorDashboardController.vendorDashboardSummary
);
vendorDashboardRouter.get(
    '/sales',
    VendorDashboardController.vendorSalesAnalytics
);
vendorDashboardRouter.get(
    '/orders/status',
    VendorDashboardController.vendorOrdersStatusCount
);

vendorDashboardRouter.get(
    '/products/top-selling',
    VendorDashboardController.vendorTopSellingProducts
);

vendorDashboardRouter.get(
    '/products/low-stock',
    VendorDashboardController.vendorLowStockProducts
);

vendorDashboardRouter.get(
    '/store/status',
    VendorDashboardController.getVendorAvailabilityStatus
);

vendorDashboardRouter.put(
    '/store/status',
    VendorDashboardController.updateVendorAvailabilityStatus
);

vendorDashboardRouter.get(
    '/orders/recent',
    VendorDashboardController.vendorRecentOrders
);
vendorDashboardRouter.get(
    '/reviews/customers',
    VendorDashboardController.vendorCustomerReviews
);
export default vendorDashboardRouter;
