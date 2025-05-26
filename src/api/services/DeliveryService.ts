import { generateRandomNumbers } from '../../utils/helpers';
import DeliveryModel, { Delivery } from '../models/Delivery';

import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderService from './OrderService';

class DeliveryService {
    async createDelivery(orderId: string) {
        const deliveryExists =
            (await DeliveryModel.find({
                orderId: orderId
            }).countDocuments()) === 0;

        if (deliveryExists) return;
        const order = await OrderService.getOrderById(orderId);
        if (!order) {
            return;
        }
        const vendor: any = order.vendor;
        const customer: any = order.user;

        const deliveryData = {
            deliveryCode: generateRandomNumbers(6),
            pickup: {
                name: vendor?.name,
                address: vendor?.address,
                lat: order.pickupLocation[1],
                long: order.pickupLocation[0]
            },
            destination: {
                name: customer.name,
                address: customer.address,
                lat: order.deliveryLocation[1],
                long: order.deliveryLocation[0]
            },
            senderDetails: {
                name: vendor.name,
                contactNumber: vendor.phone
            },
            receiverDetails: {
                name: customer.name,
                contactNumber: customer.phone
            },
            specialInstructions: '' // Any special delivery instructions
            // estimatedDeliveryTime: ''; // Estimated delivery time
        };
        const delivery = await DeliveryRepository.createDelivery(deliveryData);
        // TODO send notification

        return delivery;
    }

    async updateDeliveryStatus(deliveryId: string, status: string) {
        return await DeliveryRepository.updateDelivery(deliveryId, { status });
    }

    async getAvailableDeliveries() {
        return await DeliveryRepository.getAvailableDeliveries();
    }

    async getDeliveryById(deliveryId: string) {
        return await DeliveryRepository.getDeliveryById(deliveryId);
    }

    async getDeliveriesForRider(riderId: string) {
        return await DeliveryRepository.getDeliveriesForRider(riderId);
    }

    async getActiveDeliveries(riderId: string) {
        return await DeliveryRepository.getActiveDeliveries(riderId);
    }
}

export default new DeliveryService();
