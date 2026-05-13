import { NextFunction, Request, Response } from 'express';
import OrderService from '../../services/OrderService';
import LogService from '../../services/LogService';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class AdminOrderController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const {
                page,
                limit,
                search,
                status,
                paymentType,
                vendorId,
                customerId,
                riderId,
                code,
                reference,
                startDate,
                endDate,
                sortBy,
                sortOrder,
                paymentCompleted,
                orderType
            } = req.query;

            const orders = await OrderService.getAll({
                page,
                limit,
                search,
                status,
                paymentType,
                vendorId,
                customerId,
                riderId,
                code,
                reference,
                startDate,
                endDate,
                sortBy,
                sortOrder,
                paymentCompleted,
                orderType
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                ...orders
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
            const orders = await OrderService.getAll({ vendorId: id });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Orders fetched successfully',
                ...orders
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
            const { id } = req.params;
            const { status, reason } = req.body;
            const update = await OrderService.updateOrder(id, { status }, reason);
            if (!update) {
                throw Error(' Could not update order status');
            }

            // ✅ Audit Log
            await LogService.recordAction(
                (req as any).userdata.id,
                `Updated order #${(update as any).orderId || id} status to ${status}`
            );

            res.status(STATUS.OK).send({
                success: true,
                message: 'Order status updated successfully',
                data: update
            });
        }
    );

    assignRider = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { riderId } = req.body;
            const order = await OrderService.assignRider(id, riderId);

            // ✅ Audit Log
            await LogService.recordAction(
                (req as any).userdata.id,
                `Assigned rider to order #${(order as any).orderId || id}`
            );

            res.status(STATUS.OK).send({
                success: true,
                message: 'Rider assigned successfully',
                data: order
            });
        }
    );

    completeOrderPayment = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { orderId } = req.params;
            const completedPayment = await OrderService.updateOrder(orderId, {
                paymentCompleted: true
            });
            if (!completedPayment) {
                throw Error(' Could not complete order payment');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Order payment completed successfully',
                data: completedPayment
            });
        }
    );

    deleteTestOrder = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const deleted = await OrderService.deleteAll();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Orders deleted successfully',
                data: deleted
            });
        }
    );
}

export default new AdminOrderController();
