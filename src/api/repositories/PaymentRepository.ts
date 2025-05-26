import PaymentModel, { Payment } from "../models/Payment";

class PaymentRepository {
    async createPayment(data: Partial<Payment>): Promise<Payment> {
        const payment = new PaymentModel(data);
        return await payment.save();
    }

    async findPaymentById(paymentId: string): Promise<Payment | null> {
        return await PaymentModel.findById(paymentId);
    }
    async updatePayment(
        paymentId: string,
        updateData: Partial<Payment>
    ): Promise<Payment | null> {
        return await PaymentModel.findByIdAndUpdate(paymentId, updateData, {
            new: true
        });
    }

    async getPaymentByUser(userId: string) {
        return await PaymentModel.findOne({ userId });
    }

    async getPaymentByKey(key: string, value: any) {
        return await PaymentModel.findOne({ [key]: value });
    }

}

export default new PaymentRepository();
