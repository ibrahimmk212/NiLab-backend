import CategoryModel, { Category } from '../models/Category';

class CategoryRepository {
    async createCategory(data: Category): Promise<Category> {
        const category = new CategoryModel(data);
        return await category.save();
    }

    async findCategoryById(categoryId: string): Promise<Category | null> {
        return await CategoryModel.findById(categoryId);
    }

    async getAll(): Promise<Category[] | null> {
        return await CategoryModel.find().sort({ name: 'asc' });
    }
    async updateCategory(
        categoryId: string,
        updateData: Partial<Category>
    ): Promise<Category | null> {
        return await CategoryModel.findByIdAndUpdate(categoryId, updateData, {
            new: true
        });
    }

    async deleteCategory(categoryId: string): Promise<Category | null> {
        return await CategoryModel.findByIdAndDelete(categoryId, {
            new: true
        });
    }
}

export default new CategoryRepository();
