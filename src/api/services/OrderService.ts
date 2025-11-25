import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';
import { Transaction } from '../models/Transaction';
import WalletService from './WalletService';
import ConfigurationService from './ConfigurationService';

class OrderService {
    async createOrder(orderData: Partial<Order>): Promise<Order> {
        return await OrderRepository.createOrder(orderData);
    }

    async getOrderById(orderId: string): Promise<Order | null> {
        return await OrderRepository.findOrderById(orderId);
    }

    async getOrderByReference(paymentReference: string): Promise<Order | null> {
        return await OrderRepository.findOrderByReference(paymentReference);
    }
    async calculateDeliveryFee(distance: number): Promise<number> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) return 0;
        const deliveryFee = distance * config.deliveryFee;
        return Math.min(deliveryFee, config.maxDeliveryFee);
    }

    async calculateServiceFee(deliveryFee: number): Promise<number> {
        const config = await ConfigurationService.getConfiguration();
        if (!config) return 0;

        const serviceFee = (deliveryFee * config.serviceFee) / 100;
        return Math.min(serviceFee, config.maxServiceFee);
    }
    async getAll(options: any): Promise<any> {
        return await OrderRepository.findAll(options);
    }
    async getOrdersByVendor(
        vendorId: string,
        data: any
    ): Promise<Order[] | null> {
        return await OrderRepository.findOrderByVendor(vendorId, data);
    }

    async getVendorRecentOrders(
        vendorId: string,
        limit: number
    ): Promise<Order[] | null> {
        return await OrderRepository.findVendorRecentOrders(vendorId, limit);
    }

    async getOrdersByCustomer(
        customerId: string,
        limit: number,
        page: number,
        queryParams: any
    ): Promise<any> {
        return await OrderRepository.findOrderByCustomer(
            customerId,
            limit,
            page,
            queryParams
        );
    }
    async updateOrder(
        orderId: string,
        updateData: Partial<Order>
    ): Promise<Order | null> {
        return await OrderRepository.updateOrder(orderId, updateData);
    }

    async deleteOrder(orderId: string): Promise<Order | null> {
        return await OrderRepository.deleteOrder(orderId);
    }

    async vendorAnalytics(
        vendorId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        return await OrderRepository.vendorAnalytics(
            vendorId,
            startDate,
            endDate
        );
    }

    async adminAnalytics(startDate: Date, endDate: Date): Promise<any> {
        return await OrderRepository.adminAnalytics(startDate, endDate);
    }

    static async findOrderByReference(paymentReference: string) {
        return OrderRepository.findOrderByReference(paymentReference);
    }

    // async payVendor(order: Order): Promise<Transaction | null> {
    //  await OrderRepository.deleteOrder(orderId);
    // const transaction = await
    // const paid = WalletService.initCreditAccount({
    //     amount:order.amount,
    //     owner:order.vendor,reference:order.ref,remark,role,transactionId,transactionType
    // })
    // return;
    // }

    // Additional order-specific business logic...
}

export default new OrderService();
