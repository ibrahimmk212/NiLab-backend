/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VehicleTypeService from '../../services/VehicleTypeService';

class VehicleTypeController {
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const vehicleTypes = await VehicleTypeService.getAllVehicleTypes({
                query: req.query,
                limit: req.query.limit,
                page: req.query.page,
                search: req.query.search
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Vehicle types fetched successfully',
                ...vehicleTypes
            });
        }
    );

    getById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const vehicleType = await VehicleTypeService.getVehicleTypeById(
                req.params.id
            );
            res.status(STATUS.OK).send({
                success: true,
                message: 'Vehicle type fetched successfully',
                data: vehicleType
            });
        }
    );
}

export default new VehicleTypeController();
