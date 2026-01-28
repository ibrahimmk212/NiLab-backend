import mongoose from 'mongoose';
import { Dispatch } from '../models/Dispatch';
import DispatchRepository from '../repositories/DispatchRepository';

class DispatchService {
    async createDispatch(
        dispatchData: Partial<Dispatch>,
        session?: mongoose.ClientSession
    ) {
        return await DispatchRepository.createDispatch(dispatchData, session);
    }

    async getAllDispatches(options: any) {
        return await DispatchRepository.getAll(options);
    }

    async updateDispatch(dispatchId: string, updateData: any) {
        return await DispatchRepository.updateDispatch(dispatchId, updateData);
    }

    async addDeliveriesToDispatch(
        dispatchId: string,
        deliveryIds: string[],
        session?: mongoose.ClientSession
    ) {
        return await DispatchRepository.addDeliveriesToDispatch(
            dispatchId,
            deliveryIds,
            session
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
