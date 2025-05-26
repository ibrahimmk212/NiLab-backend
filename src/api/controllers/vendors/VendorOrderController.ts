import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../services/OrderService';

class VendorOrderController {
    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;
            const orders = await OrderService.getOrdersByVendor(vendor.id, {});
            res.status(STATUS.OK).send({
                message: 'Orders fetched successfully',
                data: orders
            });
        }
    );
    getSingle = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { vendor } = req;
            const order = await OrderService.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }

            res.status(STATUS.OK).json({
                success: true,
                message: 'Order Info',
                data: order
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const order = await OrderService.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }

            if (order.vendor != vendor.id) {
                throw Error('You dont have access to this order');
            }

            const update = await OrderService.updateOrder(id, body);
            if (!update) {
                throw Error('Failed to update order');
            }
            res.status(STATUS.OK).json({
                success: true,
                message: 'Order Updated',
                data: update
            });
        }
    );
    updateStatus = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;
            const status:
                | 'pending'
                | 'preparing'
                | 'prepared'
                | 'dispatched'
                | 'delivered'
                | 'canceled' = req.body.status;

            const order = await OrderService.getOrderById(id);
            if (!order) {
                throw Error('Order not found');
            }

            if (!['preparing', 'prepared', 'canceled'].includes(status)) {
                throw Error('Invalid status');
            }
            if (order.status == 'canceled') {
                throw Error(
                    'Order already canceled, you cannot update this order'
                );
            }

            const update = await OrderService.updateOrder(id, body);
            if (!update) {
                throw Error('Failed to update order');
            }

            //TODO If accepted status==preparing. and mode is not offline add to vendor ledger, do not accept if not paid

            // TODO add cancel details (Reson for cancellation) here, and refund money to wallet

            if (status == 'canceled') {
                // TODO refund to customer's wallet if payment is not on delivery/offline and record transaction
            }

            // TODO send notifcation to customer on status change
            res.status(STATUS.OK).json({
                success: true,
                message: 'Order Updated',
                data: order
            });
        }
    );
}

export default new VendorOrderController();
