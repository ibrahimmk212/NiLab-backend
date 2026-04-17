import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import StaffService from '../../services/StaffService';
import StaffModel from '../../models/Staff';

class AdminStaffController {
    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const {
                limit = 10,
                page = 1,
                vendorId,
                search,
                status
            } = req.query;

            const query: any = {};
            if (vendorId) query.vendor = vendorId;
            if (status) query.status = status;

            // Basic search in user name if search provided (requires populate lookup in real scenario)
            // For now, simple filter
            const staffs = await StaffModel.find(query)
                .populate('user')
                .populate('vendor')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 });

            const count = await StaffModel.countDocuments(query);

            res.status(STATUS.OK).json({
                success: true,
                message: 'All Staff fetched successfully',
                data: staffs,
                count,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count
                }
            });
        }
    );

    getSingle = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const staff = await StaffService.getStaffDetail(id);

            res.status(STATUS.OK).json({
                success: true,
                message: 'Staff detail fetched successfully',
                data: staff
            });
        }
    );

    updateStatus = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { status } = req.body;

            const updatedStaff = await StaffService.updateStaff(id, { status });

            res.status(STATUS.OK).json({
                success: true,
                message: `Staff account ${status} successfully`,
                data: updatedStaff
            });
        }
    );

    delete = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            await StaffService.deleteStaff(id);

            res.status(STATUS.OK).json({
                success: true,
                message: 'Staff account deleted successfully'
            });
        }
    );
}

export default new AdminStaffController();
