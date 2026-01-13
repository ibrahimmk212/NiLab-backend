import CollectionRepository from '../repositories/CollectionRepository';
import { Collection } from '../models/Collection';

interface ICollectionService {
    createCollection(payload: Partial<Collection>): Promise<Collection>;
    getCollections(): Promise<Collection[]>;
    getCollectionDetail(CollectionId: string): Promise<Collection>;
    getUserCollections(userId: number): Promise<Collection[]>;

    updateCollection(CollectionId: string, data: Collection): Promise<boolean>;
}

class CollectionService implements ICollectionService {
    async createCollection(payload: Partial<Collection>): Promise<Collection> {
        return CollectionRepository.createCollection(payload);
    }

    getCollections(): Promise<Collection[]> {
        return CollectionRepository.getCollections();
    }

    async getCollectionDetail(CollectionId: string): Promise<Collection> {
        const Collection = await CollectionRepository.getCollectionDetail(
            CollectionId
        );

        if (!Collection) {
            throw new Error('Collection not found');
        }

        return Collection;
    }
    async getUserCollections(userId: number): Promise<Collection[]> {
        const Collection = await CollectionRepository.getCollectionsByKey(
            'userId',
            userId as unknown as string
        );

        if (!Collection) {
            throw new Error('Collection not found');
        }

        return Collection;
    }
    async updateCollection(
        CollectionId: string,
        payload: Collection
    ): Promise<boolean> {
        const Collection = await CollectionRepository.getCollectionDetail(
            CollectionId
        );

        if (!Collection) {
            throw new Error('Collection not found');
        }

        return CollectionRepository.updateCollection(CollectionId, payload);
    }
}

export default new CollectionService();
