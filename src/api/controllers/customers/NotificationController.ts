import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class NotificationController {
    getNotifications = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { advancedResults }: any = res;

            res.status(STATUS.OK).json(advancedResults);
        }
    );
}

export default new NotificationController();
