import { Request, Response } from 'express';
import DashboardService from '../../services/DashboardService';

class DashboardController {
    async getStats(req: Request, res: Response) {
        const data = await DashboardService.getAdminStats();
        return res.json({
            success: true,
            message: 'Admin stats fetched successfully',
            data
        });
    }

    async getCharts(req: Request, res: Response) {
        const data = await DashboardService.getAdminCharts();
        return res.json({
            success: true,
            message: 'Admin charts fetched successfully',
            data
        });
    }

    async getRecentOrders(req: Request, res: Response) {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const { startDate, endDate } = req.query;
        const data = await DashboardService.getAdminRecentOrders(limit, startDate, endDate);
        return res.json({
            success: true,
            message: 'Recent orders fetched successfully',
            data
        });
    }

    async getTopVendors(req: Request, res: Response) {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const { startDate, endDate } = req.query;
        const data = await DashboardService.getAdminTopVendors(limit, startDate, endDate);
        return res.json({
            success: true,
            message: 'Top vendors fetched successfully',
            data
        });
    }

    async getVendorApplications(req: Request, res: Response) {
        const limit = req.query.limit ? Number(req.query.limit) : 5;
        const { startDate, endDate } = req.query;
        const data = await DashboardService.getAdminVendorApplications(limit, startDate, endDate);
        return res.json({
            success: true,
            message: 'Vendor applications fetched successfully',
            data
        });
    }
}

export default new DashboardController();
