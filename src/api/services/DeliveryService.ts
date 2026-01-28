import {
    generateReference,
    generateShortCode
} from '../../utils/keygen/idGenerator';
import { generateRandomNumbers } from '../../utils/helpers';
import emails from '../libraries/emails';
import DeliveryModel, { Delivery } from '../models/Delivery';

import DeliveryRepository from '../repositories/DeliveryRepository';
import OrderService from './OrderService';
import RiderService from './RiderService';
import mongoose from 'mongoose';
import DispatchService from './DispatchService';
import OrderRepository from '../repositories/OrderRepository';

class DeliveryService {
    private async notifyAvailableRiders(order: any) {
        try {
            const riders = await RiderService.findAllRiders({
                status: 'verified',
                state: order.destination?.state,
                limit: 100,
                page: 1
            });

            if (riders?.data?.length > 0) {
                const riderMails = riders.data
                    .map((r: any) => r.email)
                    .filter(Boolean)
                    .join(',');
                if (riderMails) {
                    emails.availableDelivery(riderMails, {
                        orderType: order.orderType,
                        deliveryLocation: order.destination?.street,
                        pickupLocation: order.pickup?.street
                    });
                }
            }
        } catch (err) {
            console.error('Notification Error:', err);
        }
    }
    async createDelivery(orderId: string, session?: mongoose.ClientSession) {
        // 1. Re-entrancy Guard within the session
        const deliveryExists = await DeliveryModel.findOne({
            order: orderId
        }).session(session || null);
        if (deliveryExists) return deliveryExists;

        const order: any = await OrderRepository.findOrderById(orderId);
        if (!order) throw new Error('Order not found for delivery creation');

        const deliveryData: Partial<Delivery> = {
            deliveryCode: generateShortCode(6),
            deliveryFee: order.deliveryFee,
            order: order._id,
            // Use coordinates from the order's pickup/destination objects
            pickup: {
                ...order.pickup,
                coordinates: order.pickup?.coordinates || order.pickupLocation
            },
            destination: {
                ...order.destination,
                coordinates:
                    order.destination?.coordinates || order.deliveryLocation
            },
            senderDetails: {
                name: order.vendor?.name || 'Vendor',
                contactNumber: order.vendor?.phoneNumber || '0000000000'
            },
            receiverDetails: {
                name: `${order.user?.firstName || 'Customer'} ${
                    order.user?.lastName || ''
                }`.trim(),
                contactNumber: order.user?.phoneNumber || '0000000000'
            },
            status: 'pending',
            specialInstructions: order.remark || ''
        };

        // Ensure your repository supports the session
        const delivery = await DeliveryRepository.createDelivery(
            deliveryData,
            session
        );

        // 2. Notifications (Triggered outside the transaction block or via an event)
        // We don't await this inside the DB transaction to keep it fast
        this.notifyAvailableRiders(order);

        return delivery;
    }

    async getAllDeliveries(options: any) {
        return await DeliveryRepository.getAll(options);
    }

    async updateDeliveryStatus(deliveryId: string, status: string) {
        return await DeliveryRepository.updateDelivery(deliveryId, { status });
    }

    async getAvailableDeliveries(state: string, options: any) {
        return await DeliveryRepository.getAll({
            status: 'pending',
            pickupState: state,
            riderId: null,
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

    async acceptDelivery(deliveryId: string, rider: any) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Check if rider already has an active dispatch
            let dispatch = await DispatchService.getActiveDispatch(rider.id);
            if (!dispatch) {
                dispatch = await DispatchService.createDispatch(
                    { rider: rider.id },
                    session
                );
            }

            // 2. Atomically Assign Rider (Prevents double-acceptance)
            const delivery = await DeliveryRepository.assignRiderToDelivery(
                deliveryId,
                rider.id,
                dispatch._id,
                session
            );

            if (!delivery) {
                throw new Error(
                    'Delivery already accepted by another rider or not found'
                );
            }

            // 3. Update the Order
            await OrderRepository.updateOrder(
                delivery.order.toString(),
                { rider: rider.id, deliveryAccepted: true },
                session
            );

            // 4. Update Dispatch list
            await DispatchService.addDeliveriesToDispatch(
                dispatch._id,
                [delivery._id],
                session
            );

            await session.commitTransaction();
            return delivery;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}
//

export default new DeliveryService();
