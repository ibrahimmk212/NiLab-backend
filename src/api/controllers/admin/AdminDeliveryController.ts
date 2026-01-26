import { NextFunction, Request, Response } from 'express';
import OrderService from '../../services/OrderService';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import DeliveryService from '../../services/DeliveryService';

class AdminOrderController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const deliveries = await DeliveryService.getAllDeliveries(
                req.query
            );
            res.status(STATUS.OK).send({
                success: true,
                message: 'Deliveries fetched successfully',
                ...deliveries
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
            const delivery = await DeliveryService.getDeliveryById(id);
            if (!delivery) throw new Error('Delivery not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Delivery fetched successfully',
                data: delivery
            });
        }
    );
}

export default new AdminOrderController();
