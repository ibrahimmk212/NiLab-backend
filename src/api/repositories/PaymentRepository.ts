/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClientSession } from 'mongoose';
import CollectionModel, { Collection } from '../models/Collection';

class PaymentRepository {
    /**
     * Create a new collection record (Audit log of the payment)
     */
    async createCollection(
        data: Partial<Collection>,
        session?: ClientSession
    ): Promise<Collection> {
        const collection = new CollectionModel(data);
        const result = await collection.save({ session });
        return result;
    }

    /**
     * Look up a collection by our internal NanoID reference
     */
    async findByInternalReference(
        internalReference: string
    ): Promise<Collection | null> {
        return await CollectionModel.findOne({ internalReference });
    }

    /**
     * Look up by Gateway's Transaction Reference (Idempotency Check)
     */
    async findByTransactionReference(
        transactionReference: string
    ): Promise<Collection | null> {
        return await CollectionModel.findOne({ transactionReference });
    }

    /**
     * Update collection status (e.g., when a webhook confirms a pending transfer)
     */
    async updateCollectionStatus(
        internalReference: string,
        status: Collection['status'],
        responseData: any,
        session?: ClientSession
    ): Promise<Collection | null> {
        return await CollectionModel.findOneAndUpdate(
            { internalReference },
            { status, responseData },
            { new: true, session }
        );
    }
}

export default new PaymentRepository();
