import { NextFunction, Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/handlers/async';
import VehicleTypeService from '../../services/VehicleTypeService';
import { STATUS } from '../../../constants';

class VehicleTypeController {
    getAllVehicleTypes = asyncHandler(async (req: Request, res: Response) => {
        const { search, page, limit } = req.query;
        const vehicleTypes = await VehicleTypeService.getAllVehicleTypes({
            search,
            page,
            limit
        });
        res.status(STATUS.OK).json({
            success: true,
            message: 'Delivery vehicle types fetched successfully',
            data: vehicleTypes
        });
    });

    getVehicleTypeById = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const vehicleType = await VehicleTypeService.getVehicleTypeById(id);

            if (!vehicleType) {
                return next(new Error('Vehicle type not found'));
            }
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vehicle type fetched successfully',
                data: vehicleType
            });
        }
    );

    createVehicleType = asyncHandler(async (req: Request, res: Response) => {
        const { name, feePerKm, icon } = req.body;
        const vehicleType = await VehicleTypeService.createVehicleType({
            name,
            feePerKm,
            icon
        });
        res.status(STATUS.OK).json({
            success: true,
            message: 'Vehicle type created successfully',
            data: vehicleType
        });
    });

    updateVehicleType = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const { id } = req.params;
            const { name, feePerKm, icon } = req.body;
            const vehicleType = await VehicleTypeService.updateVehicleType(id, {
                name,
                feePerKm,
                icon
            });
            if (!vehicleType) {
                return next(new Error('Vehicle type not found'));
            }
            res.status(STATUS.OK).json({
                success: true,
                message: 'Vehicle type updated successfully',
                data: vehicleType
            });
        }
    );

    deleteVehicleType = asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const vehicleType = await VehicleTypeService.deleteVehicleType(id);
        res.status(STATUS.OK).json({
            success: true,
            message: 'Vehicle type deleted successfully',
            data: vehicleType
        });
    });
}

export default new VehicleTypeController();
