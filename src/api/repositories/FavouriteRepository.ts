import FavouriteModel, { Favourite } from '../models/Favourite';

class FavouriteRepository {
    async createFavourite(data: Partial<Favourite>): Promise<Favourite> {
        const favourite = new FavouriteModel(data);
        return await favourite.save();
    }

    async findFavouriteById(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteModel.findById(favouriteId).populate(
            'product vendor'
        );
    }

    async findFavouritesByKey(
        key: string,
        value: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await FavouriteModel.countDocuments({ [key]: value });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const favourites = await FavouriteModel.find({ [key]: value })
            .populate('product vendor')
            .sort({ name: 'asc' })
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { favourites, count: favourites.length, pagination, total };
    }

    async updateFavourite(
        favouriteId: string,
        updateData: Partial<Favourite>
    ): Promise<Favourite | null> {
        return await FavouriteModel.findByIdAndUpdate(favouriteId, updateData, {
            new: true
        }).populate('product vendor');
    }

    async deleteFavourite(favouriteId: string): Promise<Favourite | null> {
        return await FavouriteModel.findByIdAndDelete(favouriteId, {
            new: true
        }).populate('product vendor');
    }

    // Additional favourite-specific methods...
}

export default new FavouriteRepository();
