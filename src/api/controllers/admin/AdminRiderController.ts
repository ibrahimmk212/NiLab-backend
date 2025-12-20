import { NextFunction, Request, Response } from 'express';
import UserService from '../../services/UserService';
import { ROLE, STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import RiderService from '../../services/RiderService';
import { generateRandomNumbers } from '../../../utils/helpers';

class AdminRiderController {
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const riders = await RiderService.findAllRiders(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Riders fetched successfully',
                ...riders
            });
        }
    );

    getSingle = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const rider = await RiderService.getRiderDetail(id);
            if (!rider) throw new Error('Rider not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Rider fetched successfully',
                data: rider
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { body } = req;
            const update = await RiderService.updateRider(id, body);
            if (!update) {
                throw Error(' Could not update rider');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Rider updated successfully',
                data: update
            });
        }
    );

    updateStatus = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { status } = req.body;

            if (!['suspend', 'verified'].includes(status)) {
                throw Error(
                    'Invalid status, only suspended and verified are allowed'
                );
            }
            const update = await RiderService.updateRider(id, { status });
            if (!update) {
                throw Error(' Could not update rider');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Rider updated successfully',
                data: update
            });
        }
    );
}

export default new AdminRiderController();
