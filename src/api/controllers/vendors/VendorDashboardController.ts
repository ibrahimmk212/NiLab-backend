// controllers/DashboardController.ts
import { Response } from 'express';
import { VendorDashboardService } from '../../services/VendorDashboardService';
import { asyncHandler } from '../../middlewares/handlers/async';

const dashboardService = new VendorDashboardService();

class VendorDashboardController {
    getVendorDashboardData = asyncHandler(async (req: any, res: Response) => {
        // req.vendor.id should be provided by your auth middleware
        const vendorId = req.vendor.id;

        const dashboardData = await dashboardService.fetchVendorDashboard(
            vendorId
        );

        return res.status(200).json({
            success: true,
            data: dashboardData
        });
    });

    toggleStoreStatus = asyncHandler(async (req: any, res: Response) => {
        const vendorId = req.vendor.id;
        const { isAvailable } = req.body;

        if (typeof isAvailable !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isAvailable status must be a boolean'
            });
        }

        const result = await dashboardService.toggleVendorAvailability(
            vendorId,
            isAvailable
        );

        return res.status(200).json({
            success: true,
            message: `Store is now ${result.isAvailable ? 'Open' : 'Closed'}`,
            data: result
        });
    });
}

export default new VendorDashboardController();
