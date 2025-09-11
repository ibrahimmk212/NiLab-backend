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

    async getAll(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }
        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            filter.$text = { $search: options.search };
        }
        if (options.available !== undefined) {
            filter.available = options.available;
        }
        if (options.ratings) {
            filter.ratings = { $gte: options.ratings };
        }
        if (options.description) {
            filter.description = { $regex: options.description, $options: 'i' };
        }
        if (options.createdAt) {
            filter.createdAt = { $gte: new Date(options.createdAt) };
        }
        if (options.updatedAt) {
            filter.updatedAt = { $gte: new Date(options.updatedAt) };
        }
        if (options.sortBy) {
            filter.sortBy = options.sortBy;
        }
        if (options.sortOrder) {
            filter.sortOrder = options.sortOrder;
        }

        const [marketCategory, total] = await Promise.all([
            MarketCategoryModel.find(filter)
                .populate('categories')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            MarketCategoryModel.countDocuments(filter)
        ]);

        return {
            total,
            count: marketCategory.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: marketCategory
        };
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
