/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../services/OrderService';
import WalletService from '../../services/WalletService';
import TransactionService from '../../services/TransactionService';
import { currentTimestamp } from '../../../utils/helpers';
import emails from '../../libraries/emails';
import NotificationService from '../../services/NotificationService';
import SettlementService from '../../services/SettlementService';

class VendorOrderController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<any> => {
            const { vendor }: any = req;

            const orders = await OrderService.getAll({
                ...req.query,
                vendorId: vendor.id
            });
            // const orders = await OrderService.getOrdersByVendor(vendor.id);

            res.status(STATUS.OK).send({
                message: 'Orders fetched successfully',
                ...orders
            });
        }
    );

    getRecent = asyncHandler(
        async (req: Request | any, res: Response): Promise<any> => {
            const { vendor } = req;
            const limit = parseInt(req.query.limit) || 5;

            const orders = await OrderService.getAll({
                vendorId: vendor.id,
                limit,
                ...req.query
            });

            res.status(STATUS.OK).send({
                message: 'Recent Orders fetched successfully',
                data: orders
            });
        }
    );
    getSingle = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<any> => {
            const { id } = req.params;
            const { vendor } = req;
            const order = await OrderService.getOrderById(id);
            if (!order) {
                return res
                    .status(STATUS.OK)
                    .json({ success: false, message: 'Order not found' });
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
        ): Promise<any> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const order = await OrderService.getOrderById(id);
            if (!order) {
                return res
                    .status(STATUS.NOT_FOUND)
                    .json({ success: false, message: 'Order not found' });
            }

            if (order.vendor != vendor.id) {
                return res.status(STATUS.FORBIDDEN).json({
                    success: false,
                    message: 'You dont have access to this order'
                });
            }

            const update = await OrderService.updateOrder(id, body);
            if (!update) {
                return res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Failed to update order'
                });
            }
            res.status(STATUS.OK).json({
                success: true,
                message: 'Order Updated',
                data: update
            });
        }
    );

    updateStatus = asyncHandler(async (req: any, res: Response) => {
        const { vendor, body, params } = req;
        const { id } = params;
        const { status, reason } = body;

        // 1. Fetch Order with necessary populations for the refund/settlement logic

        const order = await OrderService.getOrderById(id);
        if (!order) {
            return res
                .status(STATUS.NOT_FOUND)
                .json({ success: false, message: 'Order not found' });
        }

        // 2. Ownership Check
        if (order.vendor._id.toString() !== vendor.id) {
            return res.status(STATUS.FORBIDDEN).json({
                success: false,
                message: 'Unauthorized access to this order'
            });
        }

        // orders has to be paid before status can be update
        if (order.paymentCompleted === false) {
            return res.status(STATUS.BAD_REQUEST).json({
                message: 'Payment for this order is not completed yet'
            });
        }

        // 3. Status Guard: Prevent updates on final states
        if (['delivered', 'canceled'].includes(order.status)) {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: `Cannot update order in ${order.status} state.`
            });
        }

        // 4. Handle CANCELLATION & REFUND
        if (status === 'canceled' || status === 'cancelled') {
            // Run the Refund Logic (Moves System Pending -> Customer Available)
            // This method should handle order.save() and session transactions internally
            await SettlementService.refundOrder(
                order,
                order.user._id.toString(),
                reason
            );

            // Notify Customer
            await NotificationService.create({
                userId: order.user._id,
                title: 'Order Cancelled',
                message: `Your order #${order.code} has been cancelled by the vendor. Funds have been returned to your wallet.`,
                status: 'unread'
            });

            return res.status(STATUS.OK).json({
                success: true,
                message: 'Order cancelled and customer refunded successfully',
                data: order
            });
        }

        if (!order.paymentCompleted) {
            return res.status(STATUS.PAYMENT_REQUIRED).json({
                success: false,
                message: 'Order payment is not yet confirmed.'
            });
        }

        // 5. Handle PREPARING (Acceptance)
        if (status === 'preparing') {
            order.status = 'preparing';
            await order.save();

            //TODO Send Email & Notification
            const customer: any = order.user;
            emails.orderConfirmation(customer.email, {
                name: customer.firstName,
                orderId: order.code,
                deliveryTime: order.deliveryTime || 'N/A',
                orderItems: order.products,
                total: order.totalAmount.toString()
            });

            await NotificationService.create({
                userId: customer._id,
                title: 'Order Accepted',
                message: `Vendor is now preparing your order #${order.code}.`,
                status: 'unread'
            });

            return res.status(STATUS.OK).json({
                success: true,
                message: 'Order accepted',
                data: order
            });
        }

        // 6. Handle PREPARED
        if (status === 'prepared') {
            order.status = 'prepared';
            order.preparedAt = Date.now();
            await order.save();

            // Notify Customer & Trigger Rider Search Logic
            await NotificationService.create({
                userId: order.user._id,
                title: 'Order Ready',
                message: `Your order #${order.code} is ready for pickup!`,
                status: 'unread'
            });

            return res.status(STATUS.OK).json({
                success: true,
                message: 'Order marked as ready',
                data: order
            });
        }

        return res
            .status(STATUS.BAD_REQUEST)
            .json({ success: false, message: 'Invalid status transition' });
    });

    cancelOrder = asyncHandler(async (req: any, res: Response) => {
        const { orderId } = req.params;
        const { reason } = req.body;

        const order = await OrderService.getOrderById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // 1. Safety Guard: Only allow cancellation if order isn't already delivered/settled
        if (order.status === 'delivered' || order.isSettled) {
            return res
                .status(400)
                .json({ message: 'Cannot cancel a completed/settled order' });
        }

        // 2. Trigger the Refund Service
        await SettlementService.refundOrder(
            order,
            order.user.id.toString(),
            reason
        );

        res.status(200).json({
            success: true,
            message: 'Order cancelled and funds returned to wallet'
        });
    });
}

export default new VendorOrderController();
