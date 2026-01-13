/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import PaymentModel, { Payment } from '../models/Payment';
import WalletModel from '../models/Wallet';
import TransactionModel from '../models/Transaction';

type CreatePaymentDTO = {
    order: string;
    user: string;
    provider: 'MONNIFY' | 'WALLET';
    channel?: 'CARD' | 'TRANSFER' | 'USSD';
    paymentReference: string;
    amount: number;
};

class PaymentRepository {
    //  Request a payment

    static async createPayment(paymentData: CreatePaymentDTO) {
        const payment = new PaymentModel(paymentData);
        return await payment.save();
    }

    static async getPaymentById(id: string) {
        return await PaymentModel.findById(id);
    }

    static async getPaymentsByUser(userId: string) {
        return await PaymentModel.find({ user: userId });
    }

    static async getPaymentsByOrder(orderId: string) {
        return await PaymentModel.find({ order: orderId });
    }
}
export default new PaymentRepository();
