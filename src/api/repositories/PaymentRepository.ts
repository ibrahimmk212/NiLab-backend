/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientSession } from 'mongoose';
import PaymentModel, { Payment } from '../models/Payment';

class PaymentRepository {
    /**
     * Create a new Payment record (Audit log of the payment)
     */
    async createPayment(
        data: Partial<Payment>,
        session?: ClientSession
    ): Promise<Payment> {
        const Payment = new PaymentModel(data);
        const result = await Payment.save({ session });
        return result;
    }

    /**
     * Look up a Payment by our internal NanoID reference
     */
    async findByInternalReference(
        internalReference: string
    ): Promise<Payment | null> {
        return await PaymentModel.findOne({ internalReference });
    }

    /**
     * Look up by Gateway's Transaction Reference (Idempotency Check)
     */
    async findByTransactionReference(
        transactionReference: string
    ): Promise<Payment | null> {
        return await PaymentModel.findOne({ transactionReference });
    }

    /**
     * Update Payment status (e.g., when a webhook confirms a pending transfer)
     */
    async updatePaymentStatus(
        internalReference: string,
        status: Payment['status'],
        responseData: any,
        session?: ClientSession
    ): Promise<Payment | null> {
        return await PaymentModel.findOneAndUpdate(
            { internalReference },
            { status, responseData },
            { new: true, session }
        );
    }
}

export default new PaymentRepository();
