import { Request, Response } from 'express';
import DeliveryService from '../../services/DeliveryService';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import DispatchService from '../../services/DispatchService';
import OrderService from '../../services/OrderService';
import { currentTimestamp } from '../../../utils/helpers';
import TransactionService from '../../services/TransactionService';
import WalletService from '../../services/WalletService';

class DeliveryController {
    dashboard = asyncHandler(async (req: Request, res: Response) => {
        const { startDate = new Date(), endDate = new Date() } = req.query;
        const { rider }: any = req;
        const start = new Date(
            new Date(startDate.toString()).setHours(0, 0, 0)
        );
        const end = new Date(new Date(endDate.toString()).setHours(23, 59, 59));

        const {
            totalDeliveries,
            totalEarnings,
            ongoingDeliveries,
            successRate
        } = await DeliveryService.riderAnalytics(rider.id, start, end);

        res.status(STATUS.OK).json({
            success: true,
            data: {
                totalDeliveries,
                totalEarnings,
                ongoingDeliveries,
                successRate
            }
        });
    });

    availableDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const { rider, userdata }: any = req;
        const deliveries = await DeliveryService.getAvailableDeliveries(
            rider.state,
            req.query
        );

        res.status(STATUS.OK).json({
            success: true,
            ...deliveries
        });
    });
    getMyDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const { userdata, rider }: any = req;
        const { limit = 10, page = 1 } = req.query;

        const deliveries = await DeliveryService.getDeliveriesForRider(
            rider.id,
            {
                limit,
                page,
                ...req.query
            }
        );
        res.status(STATUS.OK).json({
            success: true,
            ...deliveries
        });
    });

    getActiveDeliveries = asyncHandler(async (req: Request, res: Response) => {
        const { userdata, rider }: any = req;

        const deliveries = await DeliveryService.getActiveDeliveries(rider?.id);
        res.status(STATUS.OK).json({
            success: true,
            data: deliveries
        });
    });

    acceptDelivery = asyncHandler(async (req: Request, res: Response) => {
        const { userdata, rider }: any = req;
        const { deliveryId } = req.params;

        let dispatch = await DispatchService.getActiveDispatch(rider.id);
        const delivery = await DeliveryService.getDeliveryById(deliveryId);

        if (!delivery) {
            throw Error('Delivery not found!');
        }

        if (delivery.rider) {
            throw Error('This delivery has already been accepted');
        }

        // console.log('order id', delivery.orderId);
        const order = await OrderService.getOrderById(
            delivery.order?._id?.toString()
        );

        // console.log(order);
        if (!order) {
            throw Error('Order not found!');
        }

        if (dispatch) {
            // if (dispatch.deliveries?.length >= 3) {
            //     throw Error(
            //         "You can't take more than 3 deliveries at the same time"
            //     );
            // }
        } else {
            dispatch = await DispatchService.createDispatch({
                rider: rider.id
            });
        }

        delivery.dispatch = dispatch.id;
        await DispatchService.addDeliveriesToDispatch(dispatch.id, [
            delivery.id
        ]);

        delivery.rider = rider.id;
        order.rider = rider.id;
        order.deliveryAccepted = true;
        await delivery.save();
        await order.save();
        res.status(STATUS.OK).json({
            success: true,
            data: delivery
        });
    });

    acceptCash = asyncHandler(
        async (req: Request, res: Response): Promise<any> => {
            const { rider }: any = req;
            const { deliveryId } = req.params;

            const delivery = await DeliveryService.getDeliveryById(deliveryId);

            if (!delivery) {
                throw Error('Delivery not found');
            }

            if (delivery.status !== 'in-transit') {
                throw Error('Delivery is not in a state of delivery');
            }

            const order = await OrderService.getOrderById(
                delivery.order?._id.toString()
            );

            if (!order) {
                throw Error('Order not found');
            }

            if (order.paymentType != 'cash') {
                throw Error('Order is not pay on delivery');
            }

            const reference = currentTimestamp().toString();
            const transaction = await TransactionService.createTransaction({
                amount:
                    order.amount +
                    order.serviceFee +
                    order.deliveryFee +
                    order.vat,
                userId: rider.userId,
                role: 'rider',
                type: 'DEBIT',
                remark: `Cash payment of ${order.paymentReference}`,
                status: 'pending',
                reference: reference
            });

            if (!transaction) {
                return res.status(STATUS.OK).json({
                    success: false,
                    message: 'Transaction failed'
                });
            }

            const debited = await WalletService.initDebitAccount({
                amount: transaction.amount,
                owner: rider.id.toString(),
                reference: transaction.reference,
                remark: transaction.remark,
                role: 'rider',
                transactionId: transaction.id,
                transactionType: 'debit'
            });

            console.log('debited', debited);
            if (!debited.success) {
                transaction.status = 'failed';
                await transaction.save();
                return res.status(STATUS.OK).json(debited);
            }

            transaction.status = 'successful';
            await transaction.save();

            res.status(STATUS.OK).send({
                message: 'Transactions completed',
                success: true,
                data: transaction
            });
        }
    );

    confirmDelivery = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId } = req.params;
        const { deliveryCode } = req.body;
        const { rider, userdata }: any = req;

        const delivery = await DeliveryService.getDeliveryById(deliveryId);

        if (!delivery) {
            throw Error('Delivery not found');
        }

        if (delivery.status !== 'in-transit') {
            throw Error('Delivery is not in a state of delivery');
        }

        // if (delivery.deliveryCode.slice(0, 4) !== deliveryCode) {
        //     throw Error('Invalid delivery code');
        // }

        // TODO uncomment
        // if (delivery.deliveryCode !== deliveryCode) {
        //     throw Error('Invalid delivery code');
        // }

        const order = await OrderService.getOrderById(
            delivery.order?._id.toString()
        );

        if (!order) {
            throw Error('Order not found');
        }

        // transfer delivery fee to available balance
        const transaction = await TransactionService.getTransactionByReference(
            'rider',
            rider.id,
            order?.paymentReference
        );

        if (!transaction) {
            throw Error('transaction not found');
        }

        const paid = await WalletService.confirmCreditAccount({
            amount: transaction.amount,
            owner: rider.id,
            reference: transaction.reference,
            remark: transaction.remark || '',
            role: 'rider',
            transactionId: transaction.id,
            transactionType: transaction.type
        });

        if (paid) {
            transaction.status = 'successful';
            delivery.status = 'delivered';
            delivery.actualDeliveryTime = currentTimestamp();
            order.status = 'delivered';
            order.deliveredAt = currentTimestamp();
            order.completedBy = 'rider';

            await order.save();
            await delivery.save();
            await transaction.save();
        }

        if (order.orderType == 'products' && order.vendor) {
            //  tranfer vendor fee to vendor

            // transfer delivery fee to available balance
            const vendorTransaction =
                await TransactionService.getTransactionByReference(
                    'vendor',
                    order.vendor._id.toString(),
                    order?.paymentReference
                );

            if (!vendorTransaction) {
                throw Error('transaction not found');
            }

            const vendorSettled = await WalletService.confirmCreditAccount({
                amount: vendorTransaction.amount,
                owner: order.vendor._id.toString(),
                reference: vendorTransaction.reference,
                remark: vendorTransaction.remark || '',
                role: 'vendor',
                transactionId: vendorTransaction.id,
                transactionType: vendorTransaction.type
            });

            if (vendorSettled) {
                vendorTransaction.status = 'successful';
                await vendorTransaction.save();
            }
        }

        res.status(STATUS.OK).json({
            success: true,
            data: delivery
        });
    });

    updateDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId } = req.params;
        const { status } = req.body;
        const { userdata, rider }: any = req;

        const delivery = await DeliveryService.getDeliveryById(deliveryId);
        if (!delivery) {
            throw Error('delivery not found');
        }

        if (!['in-transit', 'canceled'].includes(status)) {
            throw Error('Invalid status');
        }

        if (delivery.status == 'canceled') {
            throw Error(
                'delivery already canceled, you cannot update this delivery'
            );
        }

        if (delivery.status === 'in-transit') {
            throw Error('delivery already in-transit, you cannot update it.');
        }

        const dispatchId: string = delivery.dispatch?.toString() ?? '';

        if (status === 'canceled') {
            await DispatchService.removeDelivery(dispatchId, deliveryId);

            delivery.rider = null;
            delivery.dispatch = null;

            // TODO rebroadcast to available riders
        }

        // If accepted status==preparing. and mode is not offline add to vendor ledger, do not accept if not paid
        if (status === 'in-transit') {
            const order = await OrderService.getOrderById(
                delivery.order?._id.toString()
            );

            if (
                order?.orderType == 'products' &&
                order?.status !== 'prepared'
            ) {
                throw Error(
                    'Order is not completed by vendor, ask them to update before you pick up'
                );
            }

            const transaction = await TransactionService.createTransaction({
                amount: delivery.deliveryFee,
                userId: rider.userId,
                role: 'rider',
                order: delivery.order?._id,
                type: 'CREDIT',
                remark: 'Delivery Payment',
                status: 'pending',
                reference: order?.paymentReference
            });

            if (!transaction) {
                throw Error('transaction failed, try again');
            }

            const paid = await WalletService.initCreditAccount({
                amount: transaction.amount,
                owner: rider.id,
                reference: transaction.reference,
                remark: transaction.remark,
                role: 'rider',
                transactionId: transaction.id,
                transactionType: 'credit'
            });

            console.log('paid', paid);
            if (!paid) {
                transaction.status = 'failed';
                await transaction.save();
                throw Error('transaction failed, try again');
            }

            // return res.status(STATUS.OK).json({
            //     success: true,
            //     message: 'Items picked for delivery',
            //     data: delivery
            // });
        }

        delivery.status = status as 'canceled' | 'in-transit';
        await delivery.save();

        res.json({
            success: true,
            message: 'delivery updated',
            data: delivery
        });
    });

    getDeliveryById = asyncHandler(async (req: Request, res: Response) => {
        const { deliveryId } = req.params;
        const delivery = await DeliveryService.getDeliveryById(deliveryId);
        res.json({
            success: true,
            data: delivery
        });
    });
}

export default new DeliveryController();
