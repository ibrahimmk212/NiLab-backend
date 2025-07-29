import FavouriteRepository from '../repositories/FavouriteRepository';
import { Favourite } from '../models/Favourite';

class FavouriteService {
    async createFavourite(
        favouriteData: Partial<Favourite>
    ): Promise<Favourite> {
        return await FavouriteRepository.createFavourite(favouriteData);
    }

    async getFavouriteById(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteRepository.findFavouriteById(favouriteId);
    }

    async getFavouritesByCustomer(
        customerId: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await FavouriteRepository.findFavouritesByKey(
            'user',
            customerId,
            limit,
            page
        );
    }

    async updateFavourite(
        favouriteId: string,
        updateData: Partial<Favourite>
    ): Promise<Favourite | null> {
        return await FavouriteRepository.updateFavourite(
            favouriteId,
            updateData
        );
    }

    async deleteFavourite(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteRepository.deleteFavourite(favouriteId);
    }

    // Additional favourite-specific business logic...
}

export default new FavouriteService();
