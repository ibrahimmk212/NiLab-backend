"use strict";
// import { Request, Response, NextFunction } from 'express';
// import AuthService from '../services/AuthService';
// import { LoginType, SignUpType, VerifyOTP } from '../types/auth';
// import { STATUS } from '../../constants';
// import { asyncHandler } from '../middlewares/handlers/async';
// import JWT from '../../utils/jwt';
// import UserService from '../services/UserService';
// import UserRepository from '../repositories/UserRepository';
// import AdminService from '../services/AdminService';
// // import MonnifyApi from '../libraries/monnify/config';
// // import monnify from '../libraries/monnify';
// // import MonnifyEventHandler from '../libraries/monnify/MonnifyEventHandler';
// import OrderService from '../services/OrderService';
// class WebhookController {
//     paystack =  asyncHandler(
//         async (req: Request | any, res: Response, next: NextFunction) => {
//           const { body } = req;
//           const { reference, access_code, amount } = body.data;
//           const payment: any = await paymentService.findByKey(
//             "channelReference",
//             reference
//           );
//           if (!payment)
//             return res.json({ success: false, message: "Payment Not found" });
//           if (payment.status != "pending")
//             return res.json({
//               success: false,
//               message: "Payment Already Verified",
//             });
//           if (body?.event && body?.event.includes("charge")) {
//             // This is a checkout payment
//             const paystackPayment = await new Paystack().verifyPayment(reference);
//             await paymentService.update(payment.id, {
//               status:
//                 paystackPayment.data?.status == "success"
//                   ? "successful"
//                   : paystackPayment.data?.status,
//               responseData: JSON.stringify(body.data),
//             });
//             if (payment.action == "order") {
//               // Order Payment
//               await orderService.update(payment?.orderId, {
//                 paymentStatus:
//                   paystackPayment.data?.status == "success"
//                     ? "paid"
//                     : paystackPayment.data?.status,
//               });
//             } else if ((payment.action = "wallet_funding")) {
//               const settledAmount = amount / 100;
//               if (paystackPayment.data?.status == "success") {
//                 // get user Wallet and credit
//                 const wallet = await walletService.findByKey(
//                   "userId",
//                   payment.userId
//                 );
//                 if (!wallet)
//                   return res
//                     .status(STATUS.OK)
//                     .json({ success: false, message: "Wallet Not found" });
//                 const creditWallet = await walletHelper.creditWallet({
//                   accountId: payment.userId,
//                   amount: settledAmount,
//                   reference: payment.reference,
//                   remark: "Wallet Funding",
//                   transactionId: null,
//                   accountType: "user",
//                   details: null,
//                 });
//                 if (!creditWallet.success)
//                   return res
//                     .status(STATUS.OK)
//                     .json({
//                       success: false,
//                       message: creditWallet.message ?? "Wallet Not credited",
//                     });
//                 return res
//                   .status(STATUS.OK)
//                   .json({ success: false, message: "Wallet Funded" });
//               }
//             }
//             return res.status(STATUS.OK).json({ success: true });
//           }
//           return res.status(STATUS.OK).json({ success: true, data: "" });
//         }
//       ),
//     // monnifyEvent = asyncHandler(async (req: Request, res: Response) => {
//     //     const hashValue = req.headers['monnify-signature'];
//     //     const payload = req.body;
//     //     const computedHash = MonnifyEventHandler.computedHash(payload);
//     //     if (hashValue !== computedHash) return res.status(STATUS.BAD_REQUEST);
//     //     // get order
//     //     const order = await OrderService.getOrderByReference(
//     //         payload.paymentReference
//     //     );
//     //     if (!order) return res.status(STATUS.BAD_REQUEST);
//     //     order.paymentCompleted = true;
//     //     order.save();
//     //     console.log(order);
//     //     // TODO settled vendor
//     //     res.status(STATUS.OK);
//     // });
// }
// export default new WebhookController();
