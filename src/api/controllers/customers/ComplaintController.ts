import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import ComplaintService from '../../services/ComplaintService';
import { STATUS } from '../../../constants';

class ComplaintController {
    create = asyncHandler(async (req: Request | any, res: Response) => {
        const userId = req.userdata.id;
        const complaint = await ComplaintService.createComplaint(userId, req.body);

        res.status(STATUS.CREATED).json({
            success: true,
            message: 'Complaint submitted successfully',
            data: complaint
        });
    });

    getMyComplaints = asyncHandler(async (req: Request | any, res: Response) => {
        const userId = req.userdata.id;
        const result = await ComplaintService.getUserComplaints(userId, req.query);

        res.status(STATUS.OK).json({
            success: true,
            message: 'Complaints fetched successfully',
            data: result.data,
            pagination: result.pagination
        });
    });

    getSingle = asyncHandler(async (req: Request | any, res: Response) => {
        const { id } = req.params;
        // Ensure user owns this complaint
        const complaint = await ComplaintService.getComplaintById(id);
        
        if (!complaint) {
            return res.status(STATUS.NOT_FOUND).json({ success: false, message: 'Complaint not found' });
        }
        
        if (complaint.user._id.toString() !== req.userdata.id) {
             return res.status(STATUS.FORBIDDEN).json({ success: false, message: 'Unauthorized' });
        }

        res.status(STATUS.OK).json({
            success: true,
            data: complaint
        });
    });
}

export default new ComplaintController();
