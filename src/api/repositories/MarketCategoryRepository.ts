import MarketCategoryModel, { MarketCategory } from '../models/MarketCategory';

class MarketCategoryRepository {
    async createMarketCategory(data: MarketCategory): Promise<MarketCategory> {
        const category = new MarketCategoryModel(data);
        return await category.save();
    }

    async findMarketCategoryById(
        categoryId: string
    ): Promise<MarketCategory | null> {
        return await MarketCategoryModel.findById(categoryId);
    }

    async getAll(): Promise<MarketCategory[] | null> {
        return await MarketCategoryModel.find();
    }
    async updateMarketCategory(
        MarketCategoryId: string,
        updateData: Partial<MarketCategory>
    ): Promise<MarketCategory | null> {
        return await MarketCategoryModel.findByIdAndUpdate(
            MarketCategoryId,
            updateData,
            {
                new: true
            }
        );
    }

    async deleteMarketCategory(
        MarketCategoryId: string
    ): Promise<MarketCategory | null> {
        return await MarketCategoryModel.findByIdAndDelete(MarketCategoryId, {
            new: true
        });
    }

    // Additional category-specific methods...
}

export default new MarketCategoryRepository();
