import { generateRandomNumbers } from '../../utils/helpers';
import emails from '../libraries/emails';
import DeliveryModel, { Delivery } from '../models/Delivery';

import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderService from './OrderService';
import RiderService from './RiderService';

class DeliveryService {
    async createDelivery(orderId: string) {
        console.log(orderId);
        const deliveryExists =
            (await DeliveryModel.find({
                order: orderId
            }).countDocuments()) !== 0;
        console.log('deliveryExists', deliveryExists);
        if (deliveryExists) return;
        const order = await OrderService.getOrderById(orderId);
        if (!order) {
            console.log('order not found');
            return;
        }

        console.log('order', order);

        const deliveryData: Partial<Delivery> = {
            deliveryCode: generateRandomNumbers(6).toString(),
            deliveryFee: order.deliveryFee,
            order: order.id,
            pickup: order.pickup,
            destination: order.destination,
            senderDetails: order.senderDetails,
            receiverDetails: order.receiverDetails,
            // pickup: {
            //     name: vendor?.name,
            //     address: vendor?.address,
            //     lat: order.pickupLocation[0],
            //     long: order.pickupLocation[1]
            // },
            // destination: {
            //     name: `${customer.firstName} ${customer.lastName}`,
            //     address: order.deliveryAddress,
            //     lat: order.deliveryLocation[0],
            //     long: order.deliveryLocation[1]
            // },
            // senderDetails: {
            //     name: vendor.name,
            //     contactNumber: vendor.phone
            // },
            // receiverDetails: {
            //     name: `${customer.firstName} ${customer.lastName}`,
            //     contactNumber: customer.phoneNumber
            // },
            specialInstructions: '' // Any special delivery instructions
            // estimatedDeliveryTime: ''; // Estimated delivery time
        };
        const delivery = await DeliveryRepository.createDelivery(deliveryData);
        // TODO send notification to nearby riders
        const riders = await RiderService.getRiders();
        const riderMails = riders?.map((rider: any) => rider.email);
        emails.availableDelivery(riderMails?.toString() as string, {
            orderType: order.orderType,
            deliveryLocation: order.destination?.street,
            pickupLocation: order.pickup?.street
        });

        return delivery;
    }

    async updateDeliveryStatus(deliveryId: string, status: string) {
        return await DeliveryRepository.updateDelivery(deliveryId, { status });
    }

    async getAvailableDeliveries() {
        return await DeliveryRepository.getAvailableDeliveries();
    }
    async riderAnalytics(
        riderId: string,
        startDate: Date,
        endDate: Date
    ): Promise<any> {
        return await DeliveryRepository.riderAnalytics(
            riderId,
            startDate,
            endDate
        );
    }
    async getDeliveryById(deliveryId: string) {
        return await DeliveryRepository.getDeliveryById(deliveryId);
    }

    async getDeliveryByOrder(orderId: string) {
        return await DeliveryRepository.getDeliveryByOrder(orderId);
    }

    async getDeliveriesForRider(riderId: string, limit: number, page: number) {
        return await DeliveryRepository.getDeliveriesForRider(
            riderId,
            limit,
            page
        );
    }

    async getActiveDeliveries(riderId: string) {
        return await DeliveryRepository.getActiveDeliveries(riderId);
    }
}

export default new DeliveryService();
