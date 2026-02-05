import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import ComplaintService from '../../services/ComplaintService';
import { STATUS } from '../../../constants';

class AdminComplaintController {
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const result = await ComplaintService.getAllComplaints(req.query);

        res.status(STATUS.OK).json({
            success: true,
            message: 'All complaints fetched',
            data: result.data,
            pagination: result.pagination
        });
    });

    getSingle = asyncHandler(async (req: Request, res: Response) => {
         const { id } = req.params;
        const complaint = await ComplaintService.getComplaintById(id);
        
        if (!complaint) {
            return res.status(STATUS.NOT_FOUND).json({ success: false, message: 'Complaint not found' });
        }

        res.status(STATUS.OK).json({
            success: true,
            data: complaint
        });
    });

    resolve = asyncHandler(async (req: Request | any, res: Response) => {
        const { id } = req.params;
        const { resolution, status } = req.body;
        const adminId = req.userdata.id;

        const complaint = await ComplaintService.resolveComplaint(id, adminId, resolution, status);

        res.status(STATUS.OK).json({
            success: true,
            message: 'Complaint updated successfully',
            data: complaint
        });
    });

    notifyVendor = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { message } = req.body;

        await ComplaintService.notifyVendorAboutComplaint(id, message);

        res.status(STATUS.OK).json({
            success: true,
            message: 'Vendor notified successfully'
        });
    });
}

export default new AdminComplaintController();
