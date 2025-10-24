/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import OrderService from '../../../api/services/OrderService';
import {
    CreateOrderType,
    CreatePackageOrderType
} from '../../../api/types/order';
import Monnify from '../../../api/libraries/monnify';
import {
    currentTimestamp,
    generateRandomNumbers
} from '../../../utils/helpers';
import appConfig from '../../../config/appConfig';
import ReviewService from '../../services/ReviewService';
import OrderRepository from '../../repositories/OrderRepository';
import VendorService from '../../services/VendorService';
import DeliveryService from '../../services/DeliveryService';
import { Order } from '../../models/Order';
import { Address } from '../../models/User';
import { uploadFileToS3 } from '../../../utils/s3';
import emails from '../../libraries/emails';
import CouponService from '../../services/CouponService';
import NotificationService from '../../services/NotificationService';

class OrderController {
    upload = asyncHandler(
        async (req: Request | any, res: Response): Promise<void> => {
            const file = req?.files?.file;
            if (!req?.files?.file) throw Error('File Not selected');

            file.name = `${currentTimestamp()}_${file.name.replace(/ /g, '_')}`;

            const upload = await uploadFileToS3(file, 'packages/');

            res.status(STATUS.CREATED).send({
                success: true,
                message: 'File Updated Successfully.',
                data: upload
            });
        }
    );
    getOrders = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1, status, orderType } = req.query;
            const queryParams: any = {};
            if (status) queryParams.status = status;
            if (orderType) queryParams.orderType = orderType;

            const { orders, count, pagination, total } =
                await OrderService.getOrdersByCustomer(
                    userdata.id,
                    Number(limit),
                    Number(page),
                    queryParams
                );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: orders
            });
        }
    );

    createOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const payload: CreateOrderType = req.body;
        const deliveryAddress: Address = userdata.addresses.find(
            (address: any) => address._id == payload.addressId
        );
        if (!deliveryAddress) {
            throw Error('Address not found!');
        }
        const vendor = await VendorService.getById(payload.vendor.toString());
        if (!vendor) {
            throw Error('vendor not found');
        }
        const deliveryFee = await OrderService.calculateDeliveryFee(
            payload.distance ?? 2
        );
        const serviceFee = await OrderService.calculateServiceFee(deliveryFee);

        payload.user = userdata.id;
        payload.code = generateRandomNumbers(6);
        // payload.pickupLocation = vendor.location.coordinates;
        const reference = `ORDER_${currentTimestamp()}${userdata.id}`;

        const orderData: Partial<Order> = {
            ...payload,
            deliveryFee,
            serviceFee,
            orderType: 'products',
            paymentReference: reference,
            pickup: {
                additionalInfo: `${vendor.name} - ${vendor.phoneNumber}`,
                buildingNumber: '',
                city: vendor.location.city,
                coordinates: vendor.location.coordinates,
                label: 'Food Vendor',
                postcode: vendor.location.zipcode,
                state: vendor.location.state,
                street: vendor.address
            },
            destination: {
                additionalInfo: `${userdata.firstName} ${userdata.lastName} - ${userdata.phoneNumber}`,
                buildingNumber: deliveryAddress.buildingNumber,
                city: deliveryAddress.city,
                coordinates: deliveryAddress.coordinates,
                label: 'Food Vendor',
                postcode: deliveryAddress.postcode,
                state: deliveryAddress.state,
                street: userdata.address
            },
            senderDetails: {
                contactNumber: vendor.phoneNumber,
                name: vendor.name
            },
            receiverDetails: {
                contactNumber: userdata.phoneNumber,
                name: `${userdata.firstName} ${userdata.lastName}`
            }
        };

        let totalAmount = payload.amount + deliveryFee + serviceFee;

        if (payload.couponId) {
            const coupon = await CouponService.getCouponById(payload.couponId);
            if (coupon?.isActive && coupon.user._id == userdata.id) {
                orderData.discountAmount = coupon.discountAmount;
                orderData.discount = coupon._id;
                totalAmount = totalAmount - orderData.discountAmount;
            }
        }
        const order = await OrderService.createOrder(orderData);

        // send Order notification
        const customerNotification = `Your order with order code ${order.code} has been created successfully.`;
        NotificationService.create({
            userId: userdata.id,
            title: 'Order Created',
            message: customerNotification,
            status: 'unread'
        });

        await order?.populate(OrderRepository.populatedData);

        if (payload.paymentType === 'cash') {
            return res.status(STATUS.OK).send({
                message: 'Order created successfully',
                data: order
            });
        }
        const monnifyToken = await Monnify.genToken();

        const paymentData: any = {};
        const paymentRequest = await Monnify.initiatePayment(
            {
                amount: totalAmount, //.amount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Order Payment|${order.code}`,
                // paymentReference: `${currentTimestamp()}`,
                paymentReference: reference,
                redirectUrl: '',
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
            },
            monnifyToken
        );

        if (!paymentRequest.responseBody) {
            order.paymentReference = reference;
            order.transactionReference = 'MNFY|59|20240217230612|000526';

            await order.save();

            return res.status(STATUS.OK).json({
                success: false,
                data: order,
                payment: {
                    merchantName: 'NILAB PAYS',
                    checkoutUrl:
                        'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                    bankName: 'Wema bank',
                    accountName: 'NILAB PAYS-Ord',
                    accountNumber: '3000293913',
                    expiresOn: '2024-02-17T23:46:15',
                    totalPayable: totalAmount,
                    fee: 0,
                    ussdPayment: null,
                    paymentReference: reference,
                    transactionReference: 'MNFY|59|20240217230612|000526'
                },
                message: 'Payment not initiated, please checkout again'
            });
        }

        paymentData.merchantName = paymentRequest.responseBody?.merchantName;
        paymentData.checkoutUrl = paymentRequest.responseBody?.checkoutUrl;

        if (order.paymentType === 'transfer') {
            const transfer = await Monnify.payWithBankTransfer(
                {
                    transactionReference:
                        paymentRequest.responseBody.transactionReference
                },
                monnifyToken
            );

            if (!transfer.responseBody) {
                return res.status(STATUS.OK).json({
                    success: false,
                    data: order,
                    payment: {
                        merchantName: 'NILAB PAYS',
                        checkoutUrl:
                            'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                        bankName: 'Wema bank',
                        accountName: 'NILAB PAYS-Ord',
                        accountNumber: '3000293913',
                        expiresOn: '2024-02-17T23:46:15',
                        totalPayable: totalAmount,
                        fee: 0,
                        ussdPayment: null,
                        paymentReference: reference,
                        transactionReference: 'MNFY|59|20240217230612|000526'
                    },
                    message: 'Payment not initiated, please checkout again'
                });
            }

            paymentData.bankName = transfer.responseBody?.bankName;
            paymentData.accountName = transfer.responseBody?.accountName;
            paymentData.accountNumber = transfer.responseBody?.accountNumber;
            paymentData.expiresOn = transfer.responseBody?.expiresOn;
            paymentData.totalPayable = transfer.responseBody?.totalPayable;
            paymentData.fee = transfer.responseBody?.fee;
            paymentData.ussdPayment = transfer.responseBody?.ussdPayment;
        }

        order.paymentReference = reference;
        order.transactionReference =
            paymentRequest.responseBody?.transactionReference;
        paymentData.paymentReference = reference;
        paymentData.transactionReference =
            paymentRequest.responseBody?.transactionReference;

        await order.save();
        emails.orderPaymentReceipt(userdata.email, {
            orderId: order.code?.toString(),
            orderItems: order.products,
            totalAmount: totalAmount,
            vendorName: vendor.name
        });
        return res.status(STATUS.OK).send({
            message: 'Order created successfully',
            data: order,
            payment: paymentData
        });
    });
    createDeliveryOrder = asyncHandler(async (req: Request, res: Response) => {
        const { userdata }: any = req;
        const payload: CreatePackageOrderType = req.body;

        payload.user = userdata.id;
        payload.code = generateRandomNumbers(6);
        const deliveryFee = await OrderService.calculateDeliveryFee(
            payload.distance ?? 2
        );
        const serviceFee = await OrderService.calculateServiceFee(deliveryFee);

        const totalAmount = deliveryFee + serviceFee;
        const reference = `ORDER_${currentTimestamp()}${userdata.id}`;
        const orderData: any | Partial<Order> = {
            ...payload,
            contactNumber: userdata.phoneNumber,
            deliveryFee,
            serviceFee,
            paymentReference: reference,
            orderType: 'package',
            amount: 0
        };

        // TODO do coupon later
        // if (payload.couponId) {
        //     const coupon = await CouponService.getCouponById(payload.couponId);
        //     if (coupon?.isActive && coupon.user._id == userdata.id) {
        //         orderData.discountAmount = coupon.discountAmount;
        //         orderData.discount = coupon._id;
        //         totalAmount = totalAmount - orderData.discountAmount;
        //     }
        // }
        const order = await OrderService.createOrder(orderData);

        const delivery = await DeliveryService.createDelivery(order._id);
        if (!delivery) {
            console.log(delivery);
            await order.deleteOne();
            throw new Error('Delivery not created, please try again.');
        }

        await order?.populate(OrderRepository.populatedData);

        if (payload.paymentType === 'cash') {
            return res.status(STATUS.OK).send({
                message: 'Order created successfully',
                data: order
            });
        }
        const monnifyToken = await Monnify.genToken();

        const paymentData: any = {};
        const paymentRequest = await Monnify.initiatePayment(
            {
                amount: totalAmount, //.amount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Order Payment|${order.code}`,
                // paymentReference: `${currentTimestamp()}`,
                paymentReference: reference,
                redirectUrl: '',
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
            },
            monnifyToken
        );

        if (!paymentRequest.responseBody) {
            order.paymentReference = reference;
            order.transactionReference = 'MNFY|59|20240217230612|000526';

            await order.save();

            return res.status(STATUS.OK).json({
                success: false,
                data: order,
                payment: {
                    merchantName: 'NILAB PAYS',
                    checkoutUrl:
                        'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                    bankName: 'Wema bank',
                    accountName: 'NILAB PAYS-Ord',
                    accountNumber: '3000293913',
                    expiresOn: '2024-02-17T23:46:15',
                    totalPayable: totalAmount,
                    fee: 0,
                    ussdPayment: null,
                    paymentReference: reference,
                    transactionReference: 'MNFY|59|20240217230612|000526'
                },
                message: 'Payment not initiated, please checkout again'
            });
        }

        paymentData.merchantName = paymentRequest.responseBody?.merchantName;
        paymentData.checkoutUrl = paymentRequest.responseBody?.checkoutUrl;

        if (order.paymentType === 'transfer') {
            const transfer = await Monnify.payWithBankTransfer(
                {
                    transactionReference:
                        paymentRequest.responseBody.transactionReference
                },
                monnifyToken
            );

            if (!transfer.responseBody) {
                return res.status(STATUS.OK).json({
                    success: false,
                    data: order,
                    payment: {
                        merchantName: 'NILAB PAYS',
                        checkoutUrl:
                            'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                        bankName: 'Wema bank',
                        accountName: 'NILAB PAYS-Ord',
                        accountNumber: '3000293913',
                        expiresOn: '2024-02-17T23:46:15',
                        totalPayable: totalAmount,
                        fee: 0,
                        ussdPayment: null,
                        paymentReference: reference,
                        transactionReference: 'MNFY|59|20240217230612|000526'
                    },
                    message: 'Payment not initiated, please checkout again'
                });
            }

            paymentData.bankName = transfer.responseBody?.bankName;
            paymentData.accountName = transfer.responseBody?.accountName;
            paymentData.accountNumber = transfer.responseBody?.accountNumber;
            paymentData.expiresOn = transfer.responseBody?.expiresOn;
            paymentData.totalPayable = transfer.responseBody?.totalPayable;
            paymentData.fee = transfer.responseBody?.fee;
            paymentData.ussdPayment = transfer.responseBody?.ussdPayment;
        }

        order.paymentReference = reference;
        order.transactionReference =
            paymentRequest.responseBody?.transactionReference;

        paymentData.paymentReference = reference;
        paymentData.transactionReference =
            paymentRequest.responseBody?.transactionReference;

        await order.save();

        emails.orderPaymentReceipt(userdata.email, {
            orderId: order.code?.toString(),
            orderItems: order.products,
            totalAmount: totalAmount,
            vendorName: ''
        });
        return res.status(STATUS.OK).send({
            message: 'Order created successfully',
            data: order,
            payment: paymentData
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

    getOrderDelivery = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const delivery = await DeliveryService.getDeliveryByOrder(
                req.params.orderId
            );

            res.status(STATUS.OK).json({
                success: true,
                data: delivery
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
                // TODO notify vendor
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

        if (!order) throw Error('Order not found!');

        if (!order.paymentCompleted && order.paymentType !== 'cash') {
            // if (order.transactionReference) {
            //     return res.status(STATUS.OK).json({
            //         success: true,
            //         message: 'Proceed to payment',
            //         data: {
            //             transactionReference: order.transactionReference
            //         }
            //     });
            // } else {
            const totalAmount =
                order.amount + order.deliveryFee + order.serviceFee + order.vat;
            const monnifyToken = await Monnify.genToken();
            // console.log(monnifyToken);
            const reference = `ORDER_${currentTimestamp()}${userdata.id}`;
            const paymentData: any = {};
            const paymentRequest = await Monnify.initiatePayment(
                {
                    amount: totalAmount, //.amount,
                    customerName: `${userdata.firstName} ${userdata.lastName}`,
                    customerEmail: userdata.email,
                    paymentDescription: `Order Payment|${order.code}`,
                    // paymentReference: `${currentTimestamp()}`,
                    paymentReference: reference,
                    redirectUrl: '',
                    contractCode: appConfig.monnify.contractCode,
                    currencyCode: 'NGN',
                    paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
                },
                monnifyToken
            );

            if (!paymentRequest.responseBody) {
                order.paymentReference = reference;
                order.transactionReference = 'MNFY|59|20240217230612|000526';

                await order.save();

                return res.status(STATUS.OK).json({
                    success: false,
                    data: order,
                    payment: {
                        merchantName: 'NILAB PAYS',
                        checkoutUrl:
                            'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                        bankName: 'Wema bank',
                        accountName: 'NILAB PAYS-Ord',
                        accountNumber: '3000293913',
                        paymentReference: reference,
                        expiresOn: '2024-02-17T23:46:15',
                        totalPayable: totalAmount,
                        fee: 0,
                        ussdPayment: null
                    },
                    message: 'Payment not initiated, please checkout again'
                });
            }

            paymentData.merchantName =
                paymentRequest.responseBody?.merchantName;
            paymentData.checkoutUrl = paymentRequest.responseBody?.checkoutUrl;

            if (order.paymentType === 'transfer') {
                const transfer = await Monnify.payWithBankTransfer(
                    {
                        transactionReference:
                            paymentRequest.responseBody.transactionReference
                    },
                    monnifyToken
                );

                if (!transfer.responseBody) {
                    return res.status(STATUS.OK).json({
                        success: false,
                        data: order,
                        payment: {
                            merchantName: 'NILAB PAYS',
                            checkoutUrl:
                                'https://sandbox.sdk.monnify.com/checkout/MNFY|59|20240217230612|000526',
                            bankName: 'Wema bank',
                            accountName: 'NILAB PAYS-Ord',
                            accountNumber: '3000293913',
                            expiresOn: '2024-02-17T23:46:15',
                            paymentReference: reference,

                            totalPayable: totalAmount,
                            fee: 0,
                            ussdPayment: null
                        },
                        message: 'Payment not initiated, please checkout again'
                    });
                }
                paymentData.bankName = transfer.responseBody?.bankName;
                paymentData.accountName = transfer.responseBody?.accountName;
                paymentData.accountNumber =
                    transfer.responseBody?.accountNumber;
                paymentData.expiresOn = transfer.responseBody?.expiresOn;
                paymentData.totalPayable = transfer.responseBody?.totalPayable;
                paymentData.fee = transfer.responseBody?.fee;
                paymentData.ussdPayment = transfer.responseBody?.ussdPayment;
                paymentData.paymentReference = reference;

                // }
                order.paymentReference = reference;
                order.transactionReference =
                    paymentRequest.responseBody?.transactionReference;

                await order.save();
                emails.orderPaymentReceipt(userdata.email, {
                    orderId: order.code?.toString(),
                    orderItems: order.products,
                    totalAmount: totalAmount,
                    vendorName: ''
                });
                return res.status(STATUS.OK).json({
                    success: true,
                    message: 'Proceed to payment',
                    data: order,
                    payment: paymentData
                });
            }
        }

        return res.status(STATUS.BAD_REQUEST).json({
            success: false,
            message:
                'Invalid request: your order is either paid or pay on delivery'
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
                    'You can only submit a review when the order is comleted'
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

            order.rated = true;
            await order.save();

            // TODO notify vendor
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
