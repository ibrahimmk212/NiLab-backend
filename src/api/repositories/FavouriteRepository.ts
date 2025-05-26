import FavouriteModel, { Favourite } from '../models/Favourite';

class FavouriteRepository {
    async createFavourite(data: Favourite): Promise<Favourite> {
        const favourite = new FavouriteModel(data);
        return await favourite.save();
    }

    async findFavouriteById(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteModel.findById(favouriteId);
    }

    async updateFavourite(
        favouriteId: string,
        updateData: Partial<Favourite>
    ): Promise<Favourite | null> {
        return await FavouriteModel.findByIdAndUpdate(favouriteId, updateData, {
            new: true
        });
    }

    async deleteFavourite(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteModel.findByIdAndDelete(favouriteId, {
            new: true
        });
    }

    // Additional favourite-specific methods...
}

export default new FavouriteRepository();
