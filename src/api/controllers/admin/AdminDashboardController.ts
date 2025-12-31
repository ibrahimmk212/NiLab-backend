import { Request, Response } from 'express';
import DashboardService from '../../services/DashboardService';

class DashboardController {
    async adminDashboardStats(req: Request, res: Response) {
        const data = await DashboardService.getAdminDashboard();
        return res.json({
            success: true,
            message: 'Admin dashboard fetched successfully',
            data
        });
    }
}

export default new DashboardController();
