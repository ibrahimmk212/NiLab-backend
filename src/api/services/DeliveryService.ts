import { generateReference } from '../../utils/keygen/idGenerator';
import { generateRandomNumbers } from '../../utils/helpers';
import emails from '../libraries/emails';
import DeliveryModel, { Delivery } from '../models/Delivery';

import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderService from './OrderService';
import RiderService from './RiderService';

class DeliveryService {
    async createDelivery(orderId: string) {
        const deliveryExists = await DeliveryModel.exists({ order: orderId });
        if (deliveryExists) return;

        const order: any = await OrderService.getOrderById(orderId);
        if (!order) return;

        const deliveryData: Partial<Delivery> = {
            deliveryCode: generateReference('DEL'),
            deliveryFee: order.deliveryFee,
            order: order._id,
            pickup: {
                coordinates: order.pickupLocation,
                street: order.pickup?.street,
                city: order.pickup?.city,
                state: order.pickup?.state,
                postcode: order.pickup?.postcode,
                buildingNumber: order.pickup?.buildingNumber,
                label: order.pickup?.label,
                additionalInfo: order.pickup?.additionalInfo
            },
            destination: {
                coordinates: order.deliveryLocation,
                street: order.destination?.street,
                city: order.destination?.city,
                state: order.destination?.state,
                postcode: order.destination?.postcode,
                buildingNumber: order.destination?.buildingNumber,
                label: order.destination?.label,
                additionalInfo: order.destination?.additionalInfo
            },

            // Map Vendor to Sender (Using businessName as fallback)
            senderDetails: {
                name: order.vendor?.name || 'Vendor',
                contactNumber: order.vendor?.phoneNumber || '0000000000'
            },

            // Map Customer to Receiver
            receiverDetails: {
                name: `${order.user?.firstName || 'Customer'} ${
                    order.user?.lastName || ''
                }`.trim(),
                contactNumber: order.user?.phoneNumber || '0000000000'
            },

            status: 'pending',
            specialInstructions: order.remark || ''
        };

        const delivery = await DeliveryRepository.createDelivery(deliveryData);

        // Filter riders by state and send notification
        const riders = await RiderService.findAllRiders({
            status: 'verified',
            state: order.destination?.state,
            limit: 1000, // Reasonable limit
            page: 1
        });

        if (riders && riders.length > 0) {
            const riderMails = riders
                .map((rider: any) => rider.email)
                .filter(Boolean);
            if (riderMails.length > 0) {
                emails.availableDelivery(riderMails.join(','), {
                    orderType: order.orderType,
                    deliveryLocation: order.destination?.street,
                    pickupLocation: order.pickup?.street
                });
            }
        }

        return delivery;
    }

    async updateDeliveryStatus(deliveryId: string, status: string) {
        return await DeliveryRepository.updateDelivery(deliveryId, { status });
    }

    async getAvailableDeliveries(state: string, options) {
        return await DeliveryRepository.getAll({
            status: 'pending',
            pickupState: state,
            ...options
        });
        // return await DeliveryRepository.getAvailableDeliveries(state);
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

    async getDeliveriesForRider(riderId: string, options: any) {
        return await DeliveryRepository.getAll({
            riderId,
            ...options
        });
        // return await DeliveryRepository.getDeliveriesForRider(
        //     riderId,
        //     limit,
        //     page
        // );
    }

    async getActiveDeliveries(riderId: string) {
        return await DeliveryRepository.getActiveDeliveries(riderId);
    }
}
//

export default new DeliveryService();
