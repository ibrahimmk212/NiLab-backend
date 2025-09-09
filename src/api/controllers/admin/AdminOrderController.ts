import { NextFunction, Request, Response } from 'express';
import OrderService from '../../services/OrderService';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class AdminOrderController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const orders = await OrderService.getAll(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                data: orders
            });
        }
    );
    getByVendor = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const orders = await OrderService.getOrdersByVendor(id, {});
            res.status(STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                data: orders
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
            const order = await OrderService.getOrderById(id);
            if (!order) throw new Error('Order not available');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Order fetched successfully',
                data: order
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await OrderService.updateOrder(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        }
    );
    updateStatus = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            // const { id } = req.params;
            // const { body } = req;
            // const update = await OrderService.updateOrder(id, body);
            // if (!update) {
            //     throw Error(' Could not update order');
            // }
        }
    );
}

export default new AdminOrderController();
