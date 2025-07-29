import CollectionModel, { Collection } from '../models/Collection';

interface ICollectionRepository {
    createCollection(payload: Partial<Collection>): Promise<Collection>;
    getCollections(): Promise<Collection[]>;
    getCollectionDetail(collectionId: string): Promise<Collection | null>;
    updateCollection(
        collectionId: string,
        payload: Partial<Collection>
    ): Promise<boolean>;
    deleteCollection(collectionId: string): Promise<boolean>;
}

class CollectionRepository implements ICollectionRepository {
    createCollection(payload: Partial<Collection>): Promise<Collection> {
        return CollectionModel.create(payload);
    }

    getCollections(): Promise<Collection[]> {
        return CollectionModel.find();
    }

    getCollectionDetail(collectionId: string): Promise<Collection | null> {
        return CollectionModel.findById(collectionId);
    }
    getCollectionsByKey(key: string, val: string): Promise<Collection[]> {
        return CollectionModel.find({
            [key]: val
        });
    }
    async updateCollection(
        collectionId: string,
        payload: Partial<Collection>
    ): Promise<boolean> {
        const updatedCollectionCount = await CollectionModel.findByIdAndUpdate(
            collectionId,
            payload
        );
        return !!updatedCollectionCount;
    }

    async deleteCollection(collectionId: string): Promise<boolean> {
        const deletedCollectionCount = await CollectionModel.deleteOne({
            id: collectionId
        });
        return !!deletedCollectionCount;
    }
}

export default new CollectionRepository();
