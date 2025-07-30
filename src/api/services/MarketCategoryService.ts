import { MarketCategory } from '../models/MarketCategory';
import MarketCategoryRepository from '../repositories/MarketCategoryRepository';
interface IMarketCategoryService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class MarketCategoryService implements IMarketCategoryService {
    async create(payload: MarketCategory): Promise<any> {
        return await MarketCategoryRepository.createMarketCategory(payload);
    }

    async update(Id: string, data: any): Promise<any> {
        return await MarketCategoryRepository.updateMarketCategory(Id, data);
    }

    async find(id: string): Promise<any> {
        return await MarketCategoryRepository.findMarketCategoryById(id);
    }
    async getAll(): Promise<any> {
        return await MarketCategoryRepository.getAll();
    }
}
export default new MarketCategoryService();
