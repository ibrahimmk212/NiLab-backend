import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../../api/services/OrderService';
import { CreateOrderType } from '../../../api/types/order';
// import Monnify from '../../../api/libraries/monnify';
import {
    currentTimestamp,
    generateRandomNumbers
} from '../../../utils/helpers';
import appConfig from '../../../config/appConfig';
import ReviewService from '../../services/ReviewService';
import OrderRepository from '../../repositories/OrderRepository';
import WalletService from '../../services/WalletService';
import { generateFlutterwavePaymentLink } from '../../libraries/flutterwave';
import PaymentService from '../../services/PaymentService';
import UserService from '../../services/UserService';
import VendorService from '../../services/VendorService';

class OrderController {
    getOrders = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;

            const orders = await OrderService.getOrdersByCustomer(userdata.id);

            res.status(STATUS.OK).json({
                success: true,
                data: orders
            });
        }
    );

    createOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;

        const payload: CreateOrderType = req.body;
        payload.user = userdata.id;
        payload.code = generateRandomNumbers(6);
        payload.reference = `ref${generateRandomNumbers(6)}${Date.now()}`;
        let paymentData: any = {};
        const totalAmount =
            payload.amount +
            payload.deliveryFee +
            payload.serviceFee +
            // TODO include tip
            payload.vat;

        const vendor = await VendorService.get(payload.vendor.toString());
        if (!vendor) {
            return res.status(STATUS.BAD_REQUEST).send({
                message: 'Vendor not found'
            });
        }
        if (payload.paymentType === 'wallet') {
            const debitWallet = await WalletService.directDebitWallet({
                userId: userdata.id,
                amount: totalAmount,
                reference: payload.reference,
                // remark?:
                transactionType: 'order',
                transactionId: payload.reference
            });

            if (!debitWallet.success) {
                return res.status(STATUS.BAD_REQUEST).send({
                    message: debitWallet.message
                });
            }
            payload.paymentCompleted = true;
        }

        const order = await OrderService.createOrder(payload);
        await order?.populate(OrderRepository.populatedData);

        if (payload.paymentType === 'cash') {
            return res.status(STATUS.OK).send({
                message: 'Order created successfully',
                data: order
            });
        }
        // if (payload.paymentType === 'card') {
        //     const monnifyToken = await Monnify.genToken();

        //     const reference = `ORDER_${currentTimestamp()}${userdata.id}`;

        //     const paymentRequest = await Monnify.initiatePayment(
        //         {
        //             amount: totalAmount, //.amount,
        //             customerName: `${userdata.firstName} ${userdata.lastName}`,
        //             customerEmail: userdata.email,
        //             paymentDescription: `Order Payment|${order.code}`,
        //             // paymentReference: `${currentTimestamp()}`,
        //             paymentReference: reference,
        //             redirectUrl: '',
        //             contractCode: appConfig.monnify.contractCode,
        //             currencyCode: 'NGN',
        //             paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
        //         },
        //         monnifyToken
        //     );

        //     paymentData.merchantName = paymentRequest.responseBody?.merchantName;
        //     paymentData.checkoutUrl = paymentRequest.responseBody?.checkoutUrl;

        //     if (order.paymentType === 'transfer') {
        //         const transfer = await Monnify.payWithBankTransfer(
        //             {
        //                 transactionReference:
        //                     paymentRequest.responseBody.transactionReference
        //             },
        //             monnifyToken
        //         );

        //         paymentData.bankName = transfer.responseBody?.bankName;
        //         paymentData.accountName = transfer.responseBody?.accountName;
        //         paymentData.accountNumber = transfer.responseBody?.accountNumber;
        //         paymentData.expiresOn = transfer.responseBody?.expiresOn;
        //         paymentData.totalPayable = transfer.responseBody?.totalPayable;
        //         paymentData.fee = transfer.responseBody?.fee;
        //         paymentData.ussdPayment = transfer.responseBody?.ussdPayment;
        //     }

        //     order.paymentReference = reference;
        //     order.transactionReference =
        //         paymentRequest.responseBody?.transactionReference;

        // }
        let paymentRequest;
        const generated_trx_ref = `ORDER_${currentTimestamp()}${userdata.id}`;
        if (payload.paymentType === 'online') {
            paymentData = {
                tx_ref: generated_trx_ref,
                amount: `${totalAmount}`,
                currency: 'NGN',
                redirect_url: `${process.env.FLW_REDIRECT_URL}`,
                customer: {
                    email: userdata.email,
                    name: `${userdata.firstName} ${userdata.lastName}`,
                    phonenumber: userdata.phoneNumber
                },
                customizations: {
                    title: 'NiLab Order Payment'
                }
            };

            paymentRequest = await generateFlutterwavePaymentLink(paymentData);
            // console.log(paymentRequest)
            order.paymentReference = paymentData.tx_ref;
            if (paymentRequest.status !== 'success') {
                throw new Error(paymentRequest.message);
            }
            order.transactionReference = paymentData.tx_ref;
        }
        await order.save();

        const payment = await PaymentService.createPayment({
            userId: userdata.id,
            vendorId: order.vendor,
            orderId: order._id,
            amount: totalAmount,
            url: paymentRequest?.redirect_url,
            mode: 'online',
            trx_ref: generated_trx_ref,
            channel: 'flutterwave',
            purpose: 'order',
            status: 'pending',
            metaData: null
        });

        return res.status(STATUS.OK).send({
            message: 'Order created successfully',
            data: { ...order, vendor },
            payment: {
                ...paymentData,
                merchantName: vendor?.name,
                checkoutUrl: paymentRequest?.data?.link
            },
            paymentRecord: payment
            // paymentRequest: payload.paymentType === 'online' ? paymentRequest : null
        });
    });

    getOrderDetails = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const order = await OrderService.getOrderById(req.params.orderId);

            res.status(STATUS.OK).json({
                success: true,
                data: order
            });
        }
    );

    updateOrder = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const status = req.body.status;
            const orderId = req.params.orderId;
            console.log(userdata);

            if (!['delivered', 'canceled'].includes(status))
                throw Error(
                    'Invalid status, you can only cancel or confirm order'
                );

            const order = await OrderService.getOrderById(orderId);
            console.log(order);

            if (!order) throw Error('Order not found!');

            if (order.user?.id !== userdata.id)
                throw Error(
                    'Invalid request, you can only update your own order'
                );

            if (status === order.status)
                throw Error(`Your order is already ${status}`);

            if (status === 'canceled' && order.status !== 'pending')
                throw Error('You cannot canceled an order that is accepted');

            order.status = status;
            order.completed = true;
            order.completedBy = 'user';

            await order.save();

            if (status === 'canceled') {
                // TODO initiate refund
                // const refunded = await Monnify.initiateRefund({})
            }
            res.status(STATUS.OK).json({
                success: true,
                message: `Your order has been ${status} successfully`,
                data: order
            });
        }
    );

    checkout = asyncHandler(async (req: Request, res: Response) => {
        const { orderId } = req.params;
        const { userdata }: any = req;
        const order = await OrderService.getOrderById(orderId);
        let paymentData: any = {};
        let paymentRequest: any = {};

        if (!order) throw Error('Order not found!');
        // if (order.user.toString() !== userdata.id)
        //     throw Error('You can only checkout your own order');

        if (order.paymentCompleted)
            throw Error('You have already completed payment for this order');
        // if (order.deliveryAccepted === false)
        //     throw Error(
        //         'You cannot checkout an order that has not been accepted for delivery'
        //     );
        if (order.completed) {
            return res.status(STATUS.BAD_REQUEST).send({
                message: 'This order has already been completed'
            });
        }
        const generated_trx_ref = `ORDER_${currentTimestamp()}${userdata.id}`;
        if (order.paymentType === 'online') {
            paymentData = {
                tx_ref: generated_trx_ref,
                amount: `${order.amount}`,
                currency: 'NGN',
                redirect_url: `${process.env.FLW_REDIRECT_URL}`,
                customer: {
                    email: userdata.email,
                    name: `${userdata.firstName} ${userdata.lastName}`,
                    phonenumber: userdata.phoneNumber
                },
                customizations: {
                    title: 'NiLab Order Payment'
                }
            };

            paymentRequest = await generateFlutterwavePaymentLink(paymentData);
            // console.log(paymentRequest)
            order.paymentReference = paymentData.tx_ref;
            if (paymentRequest.status !== 'success') {
                throw new Error(paymentRequest.message);
            }
            order.transactionReference = paymentData.tx_ref;

            await order.save();
        }

        const payment = await PaymentService.createPayment({
            userId: userdata.id,
            vendorId: order.vendor,
            orderId: order._id,
            amount: order.amount,
            url: paymentRequest?.redirect_url,
            mode: 'online',
            trx_ref: generated_trx_ref,
            channel: 'flutterwave',
            purpose: 'order',
            status: 'pending',
            metaData: null
        });

        const vendor = await VendorService.get(order.vendor._id.toString());

        return res.status(STATUS.OK).send({
            message: 'Order created successfully',
            data: {
                order,
                payment: {
                    ...paymentData,
                    merchantName: vendor?.name,
                    checkoutUrl: paymentRequest?.data?.link
                },
                paymentRecord: payment
            }
            // payment: {
            //     ...paymentData,
            //     // merchantName: vendor?.name,
            //     checkoutUrl: paymentRequest?.data?.link
            // },
            // paymentRecord: payment
            // // paymentRequest: payload.paymentType === 'online' ? paymentRequest : null
        });
    });

    submitReview = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const { orderId } = req.params;
            const { rating, comment } = req.body;

            const order = await OrderService.getOrderById(orderId);

            if (!order || order.status !== 'delivered') {
                throw Error(
                    'You can only submit a review when the order is completed'
                );
            }
            if (order?.rated) {
                throw Error('You have already submit a review');
            }

            const review = await ReviewService.createReview({
                user: userdata.id,
                vendor: order?.vendor,
                rating: rating,
                comment: comment
            });

            res.status(STATUS.OK).json({
                success: true,
                message:
                    'Review submitted successful, thank you for trusting us.',
                data: review
            });
        }
    );
}

export default new OrderController();
