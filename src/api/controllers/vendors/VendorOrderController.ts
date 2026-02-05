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
import DeliveryModel from '../../models/Delivery';

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

            if (order.isSettled) {
                return res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Cannot update a settled order'
                });
            }

            if (order.status === 'delivered') {
                return res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Cannot update a delivered'
                });
            }

            if (order.status === 'canceled') {
                return res.status(STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Cannot update a canceled order'
                });
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

        const unmutableStatusByVendor = [
            'prepared',
            'dispatched',
            'delivered',
            'canceled'
        ];

        // 1. Initial Checks
        const order: any = await OrderService.getOrderById(id);

        if (!order)
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        if (unmutableStatusByVendor.includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: `You cannot update ${order.status} order`
            });
        }
        if (order.vendor._id.toString() !== vendor.id)
            return res
                .status(403)
                .json({ success: false, message: 'Unauthorized' });
        if (!order.paymentCompleted)
            return res
                .status(400)
                .json({ success: false, message: 'Payment not completed' });

        // 2. Call the Consolidated Service
        const updatedOrder = await OrderService.updateOrder(
            id,
            { status },
            reason
        );

        // 3. Handle Side Effects (Notifications/Emails)
        // These happen AFTER the DB transaction is successful
        if (status === 'preparing') {
            try {
                // Ensure user is populated or fetch if needed
                if (order.user && order.user.email) {
                    await emails.orderConfirmation(order.user.email, {
                        name: order.user.firstName,
                        orderId: order.code,
                        orderItems: order.products.map((p: any) => ({
                            name: p.name,
                            quantity: p.quantity,
                            price: p.price
                        })),
                        total: order.totalAmount.toString(),
                        deliveryTime: order.vendor.averageReadyTime || '45 mins'
                    });

                    await NotificationService.create({
                        userId: order.user._id,
                        title: 'Order Accepted',
                        message: `Your order ${order.code} has been accepted and is being prepared.`,
                        status: 'unread'
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order email:', emailError);
            }
        }

        if (status === 'prepared') {
            try {
                if (order.user) {
                    await NotificationService.create({
                        userId: order.user._id,
                        title: 'Order Ready',
                        message: `Your order ${order.code} is ready. We are assigning a rider.`,
                        status: 'unread'
                    });
                    // Email for "Prepared" / "Rider Searching" could be added here if template exists
                }

                // Notify Riders in the state
                if (order.vendor && order.vendor.state) {
                    await NotificationService.notifyRidersInState(
                        order.vendor.state,
                        'New Delivery Available',
                        `New delivery available in ${order.vendor.city || 'your area'}`
                    );
                }
            } catch (err) {
                console.error('Notification Error:', err);
            }
        }

        if (status === 'dispatched') {
             try {
                if (order.user) {
                    await NotificationService.create({
                        userId: order.user._id,
                        title: 'Order Dispatched',
                        message: `Your order ${order.code} has been dispatched and is on its way!`,
                        status: 'unread'
                    });
                }
            } catch (err) {
                console.error('Notification Error:', err);
            }
        }

        if (status === 'dispatched') {
             try {
                if (order.user) {
                    await NotificationService.create({
                        userId: order.user._id,
                        title: 'Order Dispatched',
                        message: `Your order ${order.code} has been dispatched and is on its way!`,
                        status: 'unread'
                    });
                }
            } catch (err) {
                console.error('Notification Error:', err);
            }
        }
    
        return res.status(200).json({
            message: 'Order successfully updated',
            success: true,
            data: updatedOrder
        });
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
        await SettlementService.cancelOrder(
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
