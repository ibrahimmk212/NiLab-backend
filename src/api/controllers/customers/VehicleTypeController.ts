import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VehicleTypeService from '../../services/VehicleTypeService';

class VehicleTypeController {
    getDeliveryVehicleTypes = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1, search } = req.query;

            const vehicleTypes = await VehicleTypeService.getAllVehicleTypes({
                search,
                page,
                limit
            });

            res.status(STATUS.OK).json({
                success: true,
                data: vehicleTypes
            });
        }
    );

    getVehicleTypeById = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vehicleTypeId } = req.params;
            const vehicleType = await VehicleTypeService.getVehicleTypeById(
                vehicleTypeId
            );

            if (!vehicleType) {
                return next(new Error('Vehicle type not found'));
            }

            res.status(STATUS.OK).json({
                success: true,
                data: vehicleType
            });
        }
    );
}

export default new VehicleTypeController();
