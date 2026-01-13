// import OrderModel from "../models/Order";
// import TransactionModel from "../models/Transaction";
// import TransactionModel from "../models/Transaction";
// import WalletService from "../services/WalletService";

// export default class MonnifyWebhook {
//     static async monnifyWebhook(payload: any) {
//     const { paymentReference, transactionReference, amountPaid, paymentStatus } = payload.eventData;

//     const payment = await PaymentModel.findOne({ paymentReference });

//     if (!payment || payment.status === 'SUCCESS') return;

//     if (paymentStatus !== 'PAID') {
//         payment.status = 'FAILED';
//         await payment.save();
//         return;
//     }

//     payment.status = 'SUCCESS';
//     payment.transactionReference = transactionReference;
//     payment.rawResponse = payload;
//     await payment.save();

//     const order = await OrderModel.findById(payment.order);
//     if (!order) return;

//     order.paymentCompleted = true;
//     order.transactionReference = transactionReference;
//     order.totalAmount = amountPaid;
//     await order.save();

//     // 🔥 PLATFORM REVENUE WALLET
//     // await WalletService.creditSystemWallet(amountPaid);

//     // Transaction log
//     await TransactionModel.create({
//         order: order._id,
//         userId: payment.user,
//         role: 'user',
//         reference: transactionReference,
//         amount: amountPaid,
//         type: 'DEBIT',
//         status: 'successful',
//         remark: 'Order payment via Monnify'
//     });
// }
