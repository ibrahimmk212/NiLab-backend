import { Request, Response } from 'express';
import DashboardService from '../services/DashboardService';

class DashboardController {
    async adminDashboard(req: Request, res: Response) {
        const data = await DashboardService.getAdminDashboard();
        return res.json({
            success: true,
            message: 'Admin dashboard fetched successfully',
            data
        });
    }

    async vendorDashboard(req: any, res: Response) {
        const vendorId = req.vendor.id;
        const data = await DashboardService.getVendorDashboard(vendorId);
        return res.json({
            success: true,
            message: 'Vendor dashboard fetched successfully',
            data
        });
    }

    async riderDashboard(req: Request | any, res: Response) {
        const riderId = req.user.riderId;
        const data = await DashboardService.getRiderDashboard(riderId);
        return res.json({
            success: true,
            message: 'Rider dashboard fetched successfully',
            data
        });
    }

    async salesReport(req: Request, res: Response) {
        const vendorId = req.query.vendorId as string | undefined;
        const data = await DashboardService.getSalesReport(vendorId);
        return res.json({
            success: true,
            message: 'Sales report fetched successfully',
            data
        });
    }

    // Logged in vendor only
    async mySalesReport(req: any, res: Response) {
        const vendorId = req.vendor.id as string | undefined;
        const data = await DashboardService.getSalesReport(vendorId);
        return res.json({
            success: true,
            message: 'Sales report fetched successfully',
            data
        });
    }
    async vendorSalesReport(req: any, res: Response) {
        const vendorId = req.vendor.id;
        const year = parseInt(
            (req.query.year as string) || new Date().getFullYear().toString()
        );

        const data = await DashboardService.getVendorSalesReport(
            vendorId,
            year
        );

        return res.json({
            success: true,
            message: 'Vendor sales report fetched successfully',
            data
        });
    }
}

export default new DashboardController();
