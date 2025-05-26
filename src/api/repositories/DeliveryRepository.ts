import DeliveryModel, { Delivery } from '../models/Delivery';

class DeliveryRepository {
    async createDelivery(deliveryData: Partial<Delivery>): Promise<Delivery> {
        const delivery = new DeliveryModel(deliveryData);
        return await delivery.save();
    }

    async updateDelivery(
        deliveryId: string,
        updateData: any
    ): Promise<Delivery | null> {
        return await DeliveryModel.findByIdAndUpdate(deliveryId, updateData, {
            new: true
        });
    }

    async getAvailableDeliveries(): Promise<Delivery[]> {
        return await DeliveryModel.find({ riderId: null });
    }

    async getDeliveryById(deliveryId: string): Promise<Delivery | null> {
        return await DeliveryModel.findById(deliveryId);
    }

    async getDeliveriesForRider(riderId: string): Promise<Delivery[]> {
        return await DeliveryModel.find({ riderId });
    }

    async getActiveDeliveries(riderId: string): Promise<Delivery[]> {
        return await DeliveryModel.find({
            riderId,
            status: { $ne: 'delivered' }
        });
    }

    // Add more methods as needed...
}

export default new DeliveryRepository();
