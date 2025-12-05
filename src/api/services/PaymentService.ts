/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// services/PaymentService.ts

import appConfig from '../../config/appConfig';
import { currentTimestamp } from '../../utils/helpers';
import emails from '../libraries/emails';
import Monnify from '../libraries/monnify';
import axios from 'axios';
import OrderModel from '../models/Order';

export class PaymentService {
    // Verify payment (optional: to double-check in webhook)
    static async verifyMonnifyPayment(transactionReference: string) {
        const apiKey = process.env.MONNIFY_API_KEY!;
        const secretKey = process.env.MONNIFY_SECRET_KEY!;
        const base64Credentials = Buffer.from(
            `${apiKey}:${secretKey}`
        ).toString('base64');

        // TODO : Replace with .env variables
        const response = await axios.get(
            `https://api.monnify.com/api/v1/transactions/${transactionReference}`,
            {
                headers: {
                    Authorization: `Basic ${base64Credentials}`
                }
            }
        );

        return response.data;
    }

    // Save payment result to order
    static async completeOrderPayment({
        paymentReference,
        transactionReference,
        amountPaid,
        status
    }: {
        paymentReference: string;
        transactionReference: string;
        amountPaid: number;
        status: string;
    }) {
        const order = await OrderModel.findOne({ paymentReference });

        if (!order) return null;

        // Prevent double processing
        if (order.paymentCompleted) return order;

        if (status === 'PAID' || status === 'SUCCESS') {
            order.transactionReference = transactionReference;
            order.paymentCompleted = true; // Legacy compatible
            order.amount = amountPaid; // If you want to store actual paid amount
            await order.save();
        }

        return order;
    }
    static async initiateCheckout(order: any, userdata: any) {
        if (!order) throw new Error('Order not found!');

        // Check if already paid or is cash
        if (order.paymentCompleted || order.paymentType === 'cash') {
            return {
                valid: false,
                code: 'INVALID_REQUEST',
                message:
                    'Invalid request: your order is either paid or pay on delivery'
            };
        }

        const totalAmount =
            order.amount + order.deliveryFee + order.serviceFee + order.vat;

        const monnifyToken = await Monnify.genToken();

        const reference = `ORDER_${currentTimestamp()}${userdata.id}`;

        const paymentData: any = {};

        // Step 1: Initiate Monnify Payment
        const paymentRequest = await Monnify.initiatePayment(
            {
                amount: totalAmount,
                customerName: `${userdata.firstName} ${userdata.lastName}`,
                customerEmail: userdata.email,
                paymentDescription: `Order Payment|${order.code}`,
                paymentReference: reference,
                redirectUrl: '',
                contractCode: appConfig.monnify.contractCode,
                currencyCode: 'NGN',
                paymentMethods: ['ACCOUNT_TRANSFER', 'CARD']
            },
            monnifyToken
        );

        // If Monnify fails — fallback values
        if (!paymentRequest.responseBody) {
            return this.buildFallbackResponse(order, reference, totalAmount);
        }

        paymentData.merchantName = paymentRequest.responseBody.merchantName;
        paymentData.checkoutUrl = paymentRequest.responseBody.checkoutUrl;

        // Step 2: Handle bank transfer method
        if (order.paymentType === 'transfer') {
            const transfer = await Monnify.payWithBankTransfer(
                {
                    transactionReference:
                        paymentRequest.responseBody.transactionReference
                },
                monnifyToken
            );

            if (!transfer.responseBody) {
                return this.buildFallbackResponse(
                    order,
                    reference,
                    totalAmount
                );
            }

            // Fill payment data from Monnify
            paymentData.bankName = transfer.responseBody.bankName;
            paymentData.accountName = transfer.responseBody.accountName;
            paymentData.accountNumber = transfer.responseBody.accountNumber;
            paymentData.expiresOn = transfer.responseBody.expiresOn;
            paymentData.totalPayable = transfer.responseBody.totalPayable;
            paymentData.fee = transfer.responseBody.fee;
            paymentData.ussdPayment = transfer.responseBody.ussdPayment;
            paymentData.paymentReference = reference;

            // Save reference to order
            order.paymentReference = reference;
            order.transactionReference =
                paymentRequest.responseBody.transactionReference;

            await order.save();

            // Send email
            emails.orderPaymentReceipt(userdata.email, {
                orderId: order.code?.toString(),
                orderItems: order.products,
                totalAmount: totalAmount,
                vendorName: ''
            });

            return {
                valid: true,
                message: 'Proceed to payment',
                order,
                payment: paymentData
            };
        }

        // If other payment types (like card)
        return {
            valid: true,
            message: 'Proceed to payment',
            order,
            payment: paymentData
        };
    }

    static buildFallbackResponse(
        order: any,
        reference: string,
        totalAmount: number
    ) {
        order.paymentReference = reference;
        order.transactionReference = 'MNFY|59|20240217230612|000526';

        return {
            valid: false,
            fallback: true,
            order,
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
            }
        };
    }
}
