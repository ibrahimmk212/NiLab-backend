import SubcategoryModel, { Subcategory } from "../models/Subcategory";


class SubcategoryRepository {
    async createSubcategory(data: Partial<Subcategory>): Promise<Subcategory> {
        const subcategory = new SubcategoryModel(data);
        return await subcategory.save();
    }

    async findSubcategoryById(subCategoryId: string): Promise<Subcategory | null> {
        return await SubcategoryModel.findById(subCategoryId);
    }

    async getAll(): Promise<Subcategory[] | null> {
        return await SubcategoryModel.find()
    }
    async updateSubcategory(
        categoryId: string,
        updateData: Partial<Subcategory>
    ): Promise<Subcategory | null> {
        return await SubcategoryModel.findByIdAndUpdate(categoryId, updateData, {
            new: true
        });
    }

    async deleteSubcategory(categoryId: string): Promise<Subcategory | null> {
        return await SubcategoryModel.findByIdAndDelete(categoryId, {
            new: true
        });
    }

    // Additional category-specific methods...
}

export default new SubcategoryRepository();
