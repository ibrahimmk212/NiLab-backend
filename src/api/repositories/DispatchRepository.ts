import DeliveryModel from '../models/Delivery';
import DispatchModel, { Dispatch } from '../models/Dispatch';

class DispatchRepository {
    async createDispatch(dispatchData: Partial<Dispatch>): Promise<Dispatch> {
        const dispatch = new DispatchModel(dispatchData);
        return await dispatch.save();
    }

    async updateDispatch(
        dispatchId: string,
        updateData: Partial<Dispatch>
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(dispatchId, updateData, {
            new: true
        });
    }

    async addDeliveriesToDispatch(
        dispatchId: string,
        deliveryIds: string[]
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(
            dispatchId,
            { $addToSet: { deliveries: { $each: deliveryIds } } },
            { new: true }
        );
    }

    async removeDelivery(
        dispatchId: string,
        deliveryId: string
    ): Promise<Dispatch | null> {
        return await DispatchModel.findByIdAndUpdate(
            dispatchId,
            // CHANGE THIS: $pop only takes 1 or -1. Use $pull for specific IDs.
            { $pull: { deliveries: deliveryId } },
            { new: true }
        );
    }
    async getDispatchById(dispatchId: string): Promise<Dispatch | null> {
        return await DispatchModel.findById(dispatchId).populate('deliveries');
    }

    async getDispatchesForRider(riderId: string): Promise<Dispatch[]> {
        return await DispatchModel.find({ riderId }).populate('deliveries');
    }

    async getActiveDispatch(riderId: string): Promise<Dispatch | null> {
        const dispatch = await DispatchModel.findOne({
            rider: riderId, // Fixed: should match the field 'rider' in the schema
            status: { $in: ['created', 'in-progress'] } // Better than just $ne completed
        }).populate('deliveries');
        return dispatch;
    }
    async countUnfinishedInDispatch(dispatchId: string): Promise<number> {
        return await DeliveryModel.countDocuments({
            dispatch: dispatchId,
            status: { $ne: 'delivered' }
        });
    }
}

export default new DispatchRepository();
