import { Dispatch } from '../models/Dispatch';
import DispatchRepository from '../repositories/DispatchRepository';

class DispatchService {
    async createDispatch(dispatchData: Partial<Dispatch>) {
        return await DispatchRepository.createDispatch(dispatchData);
    }

    async updateDispatch(dispatchId: string, updateData: any) {
        return await DispatchRepository.updateDispatch(dispatchId, updateData);
    }

    async addDeliveriesToDispatch(dispatchId: string, deliveryIds: string[]) {
        return await DispatchRepository.addDeliveriesToDispatch(
            dispatchId,
            deliveryIds
        );
    }

    async removeDelivery(dispatchId: string, deliveryId: string) {
        return await DispatchRepository.removeDelivery(dispatchId, deliveryId);
    }
    async getDispatchById(dispatchId: string) {
        return await DispatchRepository.getDispatchById(dispatchId);
    }

    async getDispatchesForRider(riderId: string) {
        return await DispatchRepository.getDispatchesForRider(riderId);
    }

    async getActiveDispatch(riderId: string) {
        return await DispatchRepository.getActiveDispatch(riderId);
    }

    // Additional dispatch-related business logic...
}

export default new DispatchService();
