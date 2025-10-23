/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../services/OrderService';
import WalletService from '../../services/WalletService';
import TransactionService from '../../services/TransactionService';
import { currentTimestamp } from '../../../utils/helpers';
import emails from '../../libraries/emails';

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

            const orders = await OrderService.getVendorRecentOrders(
                vendor.id,
                limit
            );

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
                    .status(STATUS.OK)
                    .json({ success: false, message: 'Order not found' });
            }

            if (order.vendor != vendor.id) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'You dont have access to this order'
                });
            }

            const update = await OrderService.updateOrder(id, body);
            if (!update) {
                return res.status(STATUS.OK).json({
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

    updateStatus = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<any> => {
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
                return res
                    .status(STATUS.OK)
                    .json({ success: false, message: 'Order not found' });
            }

            // console.log(order.vendor.id, '-', vendor.id);
            if (order.vendor.id !== vendor.id) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'Order not belong to you'
                });
            }

            if (!['preparing', 'prepared', 'canceled'].includes(status)) {
                return res
                    .status(STATUS.OK)
                    .json({ success: false, message: 'Invalid status' });
            }
            if (order.status == 'canceled') {
                return res.status(STATUS.OK).json({
                    success: false,
                    message:
                        'Order already canceled, you cannot update this order'
                });
            }

            if (!order.paymentCompleted)
                return res.status(STATUS.OK).json({
                    success: false,
                    message:
                        'Order not paid, please wait for customer to complete payment'
                });

            // If accepted status==preparing. and mode is not offline add to vendor ledger, do not accept if not paid
            if (status === 'preparing') {
                order.status = status;
                // order.pickupLocation = vendor.location?.coordinates;
                await order.save();
                const customer: any = order.user;
                emails.orderConfirmation(customer?.email, {
                    name: customer.name,
                    orderId: order.code.toString(),
                    orderItems: order.products,
                    deliveryTime: '',
                    total: order.amount.toString()
                });
                const transaction = await TransactionService.createTransaction({
                    amount: order.amount,
                    vendor: order.vendor._id,
                    order: order.id,
                    type: 'credit',
                    remark: 'Order Payment',
                    status: 'pending',
                    reference: order.paymentReference
                });

                const paid = await WalletService.initCreditAccount({
                    amount: transaction.amount,
                    owner: order.vendor.id.toString(),
                    reference: transaction.reference,
                    remark: transaction.remark,
                    role: 'vendor',
                    transactionId: transaction.id,
                    transactionType: 'credit'
                });
                // console.log('paid', paid);
                if (!paid) {
                    transaction.status = 'failed';
                    await transaction.save();
                }

                return res.status(STATUS.OK).json({
                    success: true,
                    message: 'Order Accepted',
                    data: transaction
                });
            }

            if (status == 'prepared') {
                order.status = status;
                order.preparedAt = currentTimestamp();
                await order.save();

                // TODO notify rider to pick the order
            }

            // TODO add cancel details (Reson for cancellation) here, and refund money to wallet
            if (status == 'canceled') {
                order.status = status;
                order.canceledAt = currentTimestamp();
                order.canceledReason = body.reason;
                await order.save();
            }

            // TODO send notifcation to customer on status change
            res.status(STATUS.OK).json({
                success: true,
                message: 'Order updated succesfully',
                data: order
            });
        }
    );
}

export default new VendorOrderController();
