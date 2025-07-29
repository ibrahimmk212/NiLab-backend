import CollectionRepository from '../repositories/CollectionRepository';
import { Collection } from '../models/Collection';

interface ICollectionService {
    createCollection(payload: Partial<Collection>): Promise<Collection>;
    getCollections(): Promise<Collection[]>;
    getCollectionDetail(collectionId: string): Promise<Collection>;
    getUserCollections(userId: number): Promise<Collection[]>;

    updateCollection(collectionId: string, data: Collection): Promise<boolean>;
}

class CollectionService implements ICollectionService {
    async createCollection(payload: Partial<Collection>): Promise<Collection> {
        return CollectionRepository.createCollection(payload);
    }

    getCollections(): Promise<Collection[]> {
        return CollectionRepository.getCollections();
    }

    async getCollectionDetail(collectionId: string): Promise<Collection> {
        const collection = await CollectionRepository.getCollectionDetail(
            collectionId
        );

        if (!collection) {
            throw new Error('Collection not found');
        }

        return collection;
    }
    async getUserCollections(userId: number): Promise<Collection[]> {
        const collection = await CollectionRepository.getCollectionsByKey(
            'userId',
            userId as unknown as string
        );

        if (!collection) {
            throw new Error('Collection not found');
        }

        return collection;
    }
    async updateCollection(
        collectionId: string,
        payload: Collection
    ): Promise<boolean> {
        const collection = await CollectionRepository.getCollectionDetail(
            collectionId
        );

        if (!collection) {
            throw new Error('Collection not found');
        }

        return CollectionRepository.updateCollection(collectionId, payload);
    }
}

export default new CollectionService();
