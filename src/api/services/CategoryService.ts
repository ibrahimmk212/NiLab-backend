import { Category } from '../models/Category';
import CategoryRepository from '../repositories/CategoryRepository'; 
interface ICategoryService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class CategoryService implements ICategoryService {
    async create(payload: Category): Promise<any> {
        return await CategoryRepository.createCategory(payload);
    }

    async update(Id: string, data: any): Promise<any> {
        return await CategoryRepository.updateCategory(Id, data);
    }

    async find(id: string): Promise<any> {
        return await CategoryRepository.findCategoryById(id);
    }
    async getAll(): Promise<any> {
        return await CategoryRepository.getAll();
    }
}
export default new CategoryService();
