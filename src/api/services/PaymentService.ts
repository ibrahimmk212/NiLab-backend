import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import PaymentRepository from '../repositories/PaymentRepository';
import { Payment } from '../models/Payment';

interface UpdatePaymentStatus {
    status: "pending" | "success" | "failed";
}

interface updatePaymentMeta {
    metaData: object | null; // Optional field for metadata
}


class PaymentService {

    async createPayment(createPayment: Partial<Payment>) {
        const data = await PaymentRepository.createPayment(createPayment);
    }

    async findPaymentById(paymentId: string) {
        return await PaymentRepository.findPaymentById(paymentId);
    }

    async updatePaymentStatus(paymentId: string, updatePaymentStatus: UpdatePaymentStatus) {
        const payment = await PaymentRepository.findPaymentById(paymentId);
        if (!payment) throw new Error('Payment not found');
        payment.status = updatePaymentStatus.status;
        await PaymentRepository.updatePayment(paymentId, payment);
        return payment;
    }

    async updatePaymentMeta(paymentId: string, updatePaymentMeta: updatePaymentMeta) {
        const payment = await PaymentRepository.findPaymentById(paymentId);
        if (!payment) throw new Error('Payment not found');
        payment.metaData = updatePaymentMeta.metaData;
        await PaymentRepository.updatePayment(paymentId, payment);
        return payment;
    }

    async getPaymentByUser(userId: string) {
        return await PaymentRepository.getPaymentByUser(userId);
    }

    async getPaymentByVendor(vendorId: string) {
        const data = await PaymentRepository.getPaymentByKey("vendorId", vendorId);
        if (!data) throw new Error('Payment not found');
        return data;
    }

    async getPaymentByRider(riderId: string) {
        const data = await PaymentRepository.getPaymentByKey("riderId", riderId);
        if (!data) throw new Error('Payment not found');
        return data;
    }

    async getPaymentByOrderId(orderId: string) {
        const data = await PaymentRepository.getPaymentByKey("orderId", orderId);
        if (!data) throw new Error('Payment not found');
        return data;
    }

    async getPaymentByWalletId(walletId: string) {
        const data = await PaymentRepository.getPaymentByKey("walletId", walletId);
        if (!data) throw new Error('Payment not found');
        return data;
    }

    async getPaymentByKey(key: string, value: any) {
        return await PaymentRepository.getPaymentByKey(key, value);
    }


}

export default new PaymentService();
