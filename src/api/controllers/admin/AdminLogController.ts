import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import LogService from '../../services/LogService';

class AdminLogController {
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const logs = await LogService.getAllLogs(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Logs fetched successfully',
                ...logs
            });
        }
    );
}

export default new AdminLogController();
