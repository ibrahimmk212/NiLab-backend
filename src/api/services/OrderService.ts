import OrderRepository from '../repositories/OrderRepository';
import { Order } from '../models/Order';

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

    async getAll(): Promise<Order[] | null> {
        return await OrderRepository.findAll();
    }
    async getOrdersByVendor(
        vendorId: string,
        data: any
    ): Promise<Order[] | null> {
        return await OrderRepository.findOrderByVendor(vendorId, data);
    }

    async getOrdersByCustomer(customerId: string): Promise<Order[] | null> {
        return await OrderRepository.findOrderByCustomer(customerId);
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

    // Additional order-specific business logic...
}

export default new OrderService();
