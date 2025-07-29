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
        return CategoryRepository.createCategory(payload);
    }

    async find(id: string): Promise<any> {
        return CategoryRepository.findCategoryById(id);
    }
    async update(id: string, data: any): Promise<any> {
        return CategoryRepository.updateCategory(id, data);
    }
    async getAll(): Promise<any> {
        return CategoryRepository.getAll();
    }
}
export default new CategoryService();
