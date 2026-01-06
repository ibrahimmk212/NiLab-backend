/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from '../models/Category';
import CategoryRepository from '../repositories/CategoryRepository';
interface ICategoryService {
    create(payload: any): Promise<any>;
    getAll(options: any): Promise<any[]>;
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

    async findActive(id: string): Promise<any> {
        return CategoryRepository.findActiveCategoryById(id);
    }
    async update(id: string, data: any): Promise<any> {
        return CategoryRepository.updateCategory(id, data);
    }
    async getAll(options: any): Promise<any> {
        return CategoryRepository.findAll(options);
    }
    async delete(id: string): Promise<any> {
        return CategoryRepository.deleteCategory(id);
    }
}
export default new CategoryService();
