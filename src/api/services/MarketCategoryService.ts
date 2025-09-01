import MarketCategoryModel, { MarketCategory } from '../models/MarketCategory';
import MarketCategoryRepository from '../repositories/MarketCategoryRepository';

class MarketCategoryService {
    async create(payload: MarketCategory): Promise<any> {
        return await MarketCategoryRepository.createMarketCategory(payload);
    }

    async update(Id: string, data: any): Promise<any> {
        return await MarketCategoryRepository.updateMarketCategory(Id, data);
    }

    async find(id: string): Promise<any> {
        return await MarketCategoryRepository.findMarketCategoryById(id);
    }
    async findAll(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }

        const [marketCategories, total] = await Promise.all([
            MarketCategoryModel.find(filter)
                .populate('categories')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            MarketCategoryModel.countDocuments(filter)
        ]);

        return {
            total,
            count: marketCategories.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: marketCategories
        };
    }
}
export default new MarketCategoryService();
