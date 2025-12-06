/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import DashboardService from '../../services/DashboardService';

class DashboardController {
    async vendorDashboardSummary(req: any, res: Response) {
        const vendorId = req.vendor.id;
        const data = await DashboardService.getVendorDashboard(vendorId);
        return res.json({
            success: true,
            message: 'Vendor dashboard fetched successfully',
            data
        });
    }

    async vendorSalesAnalytics(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const period =
            (req.query.period as 'daily' | 'weekly' | 'monthly' | 'yearly') ||
            'monthly';
        const data = await DashboardService.getVendorSalesAnalytics(
            vendorId,
            period
        );
        return res.json({
            success: true,
            message: 'Vendor sales analytics fetched successfully',
            data
        });
    }

    async vendorOrdersStatusCount(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const data = await DashboardService.getVendorOrdersStatusCount(
            vendorId
        );
        return res.json({
            success: true,
            message: 'Vendor orders status count fetched successfully',
            data
        });
    }

    async vendorTopSellingProducts(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const limit = parseInt(req.query.limit as string) || 5;
        const data = await DashboardService.getVendorTopSellingProducts(
            vendorId,
            limit
        );
        return res.json({
            success: true,
            message: 'Vendor top selling products fetched successfully',
            data
        });
    }

    async vendorLowStockProducts(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const threshold = parseInt(req.query.threshold as string) || 5;
        const data = await DashboardService.getVendorLowStockProducts(
            vendorId,
            threshold
        );
        return res.json({
            success: true,
            message: 'Vendor low stock products fetched successfully',
            data
        });
    }

    async getVendorAvailabilityStatus(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const data = await DashboardService.getVendorAvailabilityStatus(
            vendorId
        );
        return res.json({
            success: true,
            message: 'Vendor availability status fetched successfully',
            data
        });
    }

    async updateVendorAvailabilityStatus(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const { isAvailable } = req.body;
        const data = await DashboardService.updateVendorAvailabilityStatus(
            vendorId,
            isAvailable
        );
        return res.json({
            success: true,
            message: 'Vendor availability status updated successfully',
            data
        });
    }

    async vendorRecentOrders(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const limit = parseInt(req.query.limit as string) || 5;
        const data = await DashboardService.getVendorRecentOrders(
            vendorId,
            limit
        );
        return res.json({
            success: true,
            message: 'Vendor recent orders fetched successfully',
            data
        });
    }

    async vendorCustomerReviews(req: Request, res: Response) {
        const vendorId = (req as any).vendor.id;
        const limit = parseInt(req.query.limit as string) || 5;
        const data = await DashboardService.getVendorCustomerReviews(
            vendorId,
            limit
        );
        return res.json({
            success: true,
            message: 'Vendor customer reviews fetched successfully',
            data
        });
    }
}

export default new DashboardController();
