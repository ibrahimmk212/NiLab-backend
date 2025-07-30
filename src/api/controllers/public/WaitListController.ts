import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import WaitListService from '../../services/WaitListService';
import UserService from '../../services/UserService';

class WaitListController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const existingRecord = await WaitListService.findByEmailOrPhone(req.body.email, req.body.phone)
            if (existingRecord && existingRecord.phone === req.body.phone) {
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Phone number already registered'
                });
            }

            if (existingRecord && existingRecord.email === req.body.email) {
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Email number already registered'
                });
            }

            const newWaitList = await WaitListService.create(req.body);
            if (!newWaitList)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Waitlist'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Waitlist Created Successfully',
                data: newWaitList
            });
        }
    );
}

export default new WaitListController();
