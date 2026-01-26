import { Request, Response } from 'express';
import DeliveryService from '../../services/DeliveryService';
import { asyncHandler } from '../../middlewares/handlers/async';
import { STATUS } from '../../../constants';
import DispatchService from '../../services/DispatchService';
import OrderService from '../../services/OrderService';
import { currentTimestamp } from '../../../utils/helpers';
import TransactionService from '../../services/TransactionService';
import WalletService from '../../services/WalletService';
import SettlementService from '../../services/SettlementService';

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

    CompleteOrderDelivery = asyncHandler(
        async (req: Request, res: Response) => {
            const { deliveryId } = req.params;
            const { rider, userdata }: any = req;

            const { deliveryCode } = req.body;

            // get delivery
            // confirm the rider is actually assign to the current package
            // confirm the deliverycode provided by the customer
            const delivery: any = await DeliveryService.getDeliveryById(
                deliveryId
            );
            if (!delivery) {
                throw Error('delivery not found');
            }
            if (delivery.rider.id !== rider.id) throw new Error('Unauthorized');
            if (delivery.deliveryCode !== deliveryCode)
                throw new Error('invalid delivery code');

            if (!delivery) {
                throw Error('Delivery not found');
            }

            const completeOrderDelivery = await OrderService.completeOrder(
                delivery.order?._id.toString(),
                userdata.id
            );

            res.status(STATUS.OK).json({
                message: 'Delivery confirmed and funds settled',
                success: true,
                data: completeOrderDelivery
            });
        }
    );

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
            message: 'Delivery accepted',
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
                userId: rider.userId,
                role: 'rider',
                type: 'DEBIT',
                category: 'CASH_COLLECTION',
                remark: `Cash payment of ${order.paymentReference}`,
                status: 'pending',
                reference: reference,
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

        if (!delivery) throw Error('Delivery not found');

        // 1. Security & State Validation
        if (delivery.rider?.toString() !== rider.id.toString()) {
            throw Error('Unauthorized: You are not assigned to this delivery');
        }

        if (delivery.status !== 'in-transit') {
            throw Error('Delivery must be in-transit to be confirmed');
        }

        // 2. Code Verification
        if (delivery.deliveryCode !== deliveryCode) {
            throw Error(
                'Invalid delivery code. Please check with the customer.'
            );
        }

        const order = await OrderService.getOrderById(
            delivery.order?._id.toString()
        );
        if (!order) throw Error('Order not found');

        // 3. Update Statuses
        delivery.status = 'delivered';
        delivery.actualDeliveryTime = currentTimestamp();

        order.status = 'delivered';
        order.deliveredAt = currentTimestamp();
        order.completedBy = 'rider';

        if (order.paymentType === 'cash') {
            order.paymentCompleted = true;
        }

        await delivery.save();
        await order.save();

        // 4. Trigger Your Settlement Service
        // We pass the IDs as required by your service definition
        try {
            await SettlementService.settleOrder(order, userdata.id);
        } catch (error) {
            console.error(
                `Financial Settlement Failed for Order ${order.code}:`,
                error
            );
            // We don't throw error here to avoid blocking the UI,
            // but in production, you'd log this for admin manual settlement.
        }

        res.status(STATUS.OK).json({
            success: true,
            message: 'Delivery confirmed and funds settled',
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

        if (status === 'in-transit') {
            const order = await OrderService.getOrderById(
                delivery.order?._id.toString()
            );

            if (
                order?.orderType === 'products' &&
                order?.status !== 'prepared'
            ) {
                throw Error(
                    'Order is not completed by vendor, ask them to update before you pick up'
                );
            }

            /**
             * TRANSACTION LOGGING
             * We create this so the rider can see "Pending Earnings" in their app.
             * category: 'DELIVERY' fixes the Mongoose ValidationError.
             */
            await TransactionService.createTransaction({
                amount: delivery.deliveryFee,
                userId: rider.userId,
                role: 'rider',
                order: delivery.order?._id,
                type: 'CREDIT',
                category: 'DELIVERY',
                remark: 'Delivery Fee (Earned on completion)',
                status: 'pending', // This ensures it doesn't add to availableBalance yet
                reference: order?.paymentReference
            });
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
