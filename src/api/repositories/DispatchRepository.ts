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
            { $pop: { deliveries: { deliveryId } } },
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
            riderId,
            status: { $ne: 'completed' }
        }).populate('deliveries');
        return dispatch;
    }

    // Additional methods to handle dispatch-specific logic...
}

export default new DispatchRepository();
