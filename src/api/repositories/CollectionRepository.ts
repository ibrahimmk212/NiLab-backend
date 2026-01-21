import { ClientSession } from 'mongoose';
import CollectionModel, { Collection } from '../models/Collection';

interface ICollectionRepository {
    createCollection(payload: Partial<Collection>): Promise<Collection>;
    getCollections(): Promise<Collection[]>;
    getCollectionDetail(CollectionId: string): Promise<Collection | null>;
    updateCollection(
        CollectionId: string,
        payload: Partial<Collection>
    ): Promise<boolean>;
    deleteCollection(CollectionId: string): Promise<boolean>;
}

class CollectionRepository implements ICollectionRepository {
    createCollection(
        payload: Partial<Collection>,
        session?: ClientSession
    ): Promise<Collection> {
        const collection = new CollectionModel(payload);
        return collection.save({ session });
    }

    getCollections(): Promise<Collection[]> {
        return CollectionModel.find();
    }

    getCollectionDetail(CollectionId: string): Promise<Collection | null> {
        return CollectionModel.findById(CollectionId);
    }
    getCollectionsByKey(key: string, val: string): Promise<Collection[]> {
        return CollectionModel.find({
            [key]: val
        });
    }
    async updateCollection(
        CollectionId: string,
        payload: Partial<Collection>
    ): Promise<boolean> {
        const updatedCollectionCount = await CollectionModel.findByIdAndUpdate(
            CollectionId,
            payload
        );
        return !!updatedCollectionCount;
    }

    async deleteCollection(CollectionId: string): Promise<boolean> {
        const deletedCollectionCount = await CollectionModel.deleteOne({
            id: CollectionId
        });
        return !!deletedCollectionCount;
    }
}

export default new CollectionRepository();
