"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const async_1 = require("../../middlewares/handlers/async");
const OrderService_1 = __importDefault(require("../../../api/services/OrderService"));
// import Monnify from '../../../api/libraries/monnify';
const helpers_1 = require("../../../utils/helpers");
const ReviewService_1 = __importDefault(require("../../services/ReviewService"));
const OrderRepository_1 = __importDefault(require("../../repositories/OrderRepository"));
const WalletService_1 = __importDefault(require("../../services/WalletService"));
const flutterwave_1 = require("../../libraries/flutterwave");
const PaymentService_1 = __importDefault(require("../../services/PaymentService"));
const VendorService_1 = __importDefault(require("../../services/VendorService"));
class OrderController {
    constructor() {
        this.getOrders = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            const orders = await OrderService_1.default.getOrdersByCustomer(userdata.id);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: orders
            });
        });
        this.createOrder = (0, async_1.asyncHandler)(async (req, res) => {
            var _a;
            const { userdata } = req;
            const payload = req.body;
            payload.user = userdata.id;
            payload.code = (0, helpers_1.generateRandomNumbers)(6);
            payload.reference = `ref${(0, helpers_1.generateRandomNumbers)(6)}${Date.now()}`;
            let paymentData = {};
            const totalAmount = payload.amount +
                payload.deliveryFee +
                payload.serviceFee +
                // TODO include tip
                payload.vat;
            const vendor = await VendorService_1.default.get(payload.vendor.toString());
            if (!vendor) {
                return res.status(constants_1.STATUS.BAD_REQUEST).send({
                    message: 'Vendor not found',
                });
            }
            if (payload.paymentType === 'wallet') {
                const debitWallet = await WalletService_1.default.directDebitWallet({
                    userId: userdata.id,
                    amount: totalAmount,
                    reference: payload.reference,
                    // remark?: 
                    transactionType: "order",
                    transactionId: payload.reference
                });
                if (!debitWallet.success) {
                    return res.status(constants_1.STATUS.BAD_REQUEST).send({
                        message: debitWallet.message,
                    });
                }
                payload.paymentCompleted = true;
            }
            const order = await OrderService_1.default.createOrder(payload);
            await (order === null || order === void 0 ? void 0 : order.populate(OrderRepository_1.default.populatedData));
            if (payload.paymentType === 'cash') {
                return res.status(constants_1.STATUS.OK).send({
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
            const generated_trx_ref = `ORDER_${(0, helpers_1.currentTimestamp)()}${userdata.id}`;
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
                paymentRequest = await (0, flutterwave_1.generateFlutterwavePaymentLink)(paymentData);
                // console.log(paymentRequest)
                order.paymentReference = paymentData.tx_ref;
                if (paymentRequest.status !== "success") {
                    throw new Error(paymentRequest.message);
                }
                order.transactionReference = paymentData.tx_ref;
            }
            await order.save();
            const payment = await PaymentService_1.default.createPayment({
                userId: userdata.id,
                vendorId: order.vendor,
                orderId: order._id,
                amount: totalAmount,
                url: paymentRequest === null || paymentRequest === void 0 ? void 0 : paymentRequest.redirect_url,
                mode: 'online',
                trx_ref: generated_trx_ref,
                channel: 'flutterwave',
                purpose: 'order',
                status: 'pending',
                metaData: null
            });
            return res.status(constants_1.STATUS.OK).send({
                message: 'Order created successfully',
                data: Object.assign(Object.assign({}, order), { vendor }),
                payment: Object.assign(Object.assign({}, paymentData), { merchantName: vendor === null || vendor === void 0 ? void 0 : vendor.name, checkoutUrl: (_a = paymentRequest === null || paymentRequest === void 0 ? void 0 : paymentRequest.data) === null || _a === void 0 ? void 0 : _a.link }),
                paymentRecord: payment,
                // paymentRequest: payload.paymentType === 'online' ? paymentRequest : null
            });
        });
        this.getOrderDetails = (0, async_1.asyncHandler)(async (req, res) => {
            const order = await OrderService_1.default.getOrderById(req.params.orderId);
            res.status(constants_1.STATUS.OK).json({
                success: true,
                data: order
            });
        });
        this.updateOrder = (0, async_1.asyncHandler)(async (req, res) => {
            var _a;
            const { userdata } = req;
            const status = req.body.status;
            const orderId = req.params.orderId;
            console.log(userdata);
            if (!['delivered', 'canceled'].includes(status))
                throw Error('Invalid status, you can only cancel or confirm order');
            const order = await OrderService_1.default.getOrderById(orderId);
            console.log(order);
            if (!order)
                throw Error('Order not found!');
            if (((_a = order.user) === null || _a === void 0 ? void 0 : _a.id) !== userdata.id)
                throw Error('Invalid request, you can only update your own order');
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
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: `Your order has been ${status} successfully`,
                data: order
            });
        });
        this.checkout = (0, async_1.asyncHandler)(async (req, res) => {
            const { orderId } = req.params;
            const { userdata } = req;
            const order = await OrderService_1.default.getOrderById(orderId);
            let paymentData = {};
            if (!order)
                throw Error('Order not found!');
            // if (!order.paymentCompleted && order.paymentType !== 'cash') {
            //     // if (order.transactionReference) {
            //     //     return res.status(STATUS.OK).json({
            //     //         success: true,
            //     //         message: 'Proceed to payment',
            //     //         data: {
            //     //             transactionReference: order.transactionReference
            //     //         }
            //     //     });
            //     // } else {
            //     const totalAmount =
            //         order.amount + order.deliveryFee + order.serviceFee + order.vat;
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
            //     paymentData.merchantName =
            //         paymentRequest.responseBody?.merchantName;
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
            //         paymentData.accountNumber =
            //             transfer.responseBody?.accountNumber;
            //         paymentData.expiresOn = transfer.responseBody?.expiresOn;
            //         paymentData.totalPayable = transfer.responseBody?.totalPayable;
            //         paymentData.fee = transfer.responseBody?.fee;
            //         paymentData.ussdPayment = transfer.responseBody?.ussdPayment;
            //         // }
            //         order.paymentReference = reference;
            //         order.transactionReference =
            //             paymentRequest.responseBody?.transactionReference;
            //         await order.save();
            //         return res.status(STATUS.OK).json({
            //             success: true,
            //             message: 'Proceed to payment',
            //             data: order,
            //             payment: paymentData
            //         });
            //     }
            // }
            return res.status(constants_1.STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Invalid request: your order is either paid or pay on delivery'
            });
        });
        this.submitReview = (0, async_1.asyncHandler)(async (req, res) => {
            const { userdata } = req;
            const { orderId } = req.params;
            const { rating, comment } = req.body;
            const order = await OrderService_1.default.getOrderById(orderId);
            if (!order || order.status !== 'delivered') {
                throw Error('You can only submit a review when the order is completed');
            }
            if (order === null || order === void 0 ? void 0 : order.rated) {
                throw Error('You have already submit a review');
            }
            const review = await ReviewService_1.default.createReview({
                user: userdata.id,
                vendor: order === null || order === void 0 ? void 0 : order.vendor,
                rating: rating,
                comment: comment
            });
            res.status(constants_1.STATUS.OK).json({
                success: true,
                message: 'Review submitted successful, thank you for trusting us.',
                data: review
            });
        });
    }
}
exports.default = new OrderController();
