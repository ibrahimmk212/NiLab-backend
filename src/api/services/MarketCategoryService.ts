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
        return await MarketCategoryRepository.getAll(options);
    }
}
export default new MarketCategoryService();
