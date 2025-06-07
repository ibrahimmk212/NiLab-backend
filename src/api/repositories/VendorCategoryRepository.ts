import VendorCategoryModel, { VendorCategory } from "../models/VendorCategory";


class VendorCategoryRepository {
    async createVendorCategory(data: VendorCategory): Promise<VendorCategory> {
        const category = new VendorCategoryModel(data);
        return await category.save();
    }

    async findVendorCategoryById(categoryId: string): Promise<VendorCategory | null> {
        return await VendorCategoryModel.findById(categoryId);
    }

    async getAll(): Promise<VendorCategory[] | null> {
        return await VendorCategoryModel.find();
    }
    async updateVendorCategory(
        VendorCategoryId: string,
        updateData: Partial<VendorCategory>
    ): Promise<VendorCategory | null> {
        return await VendorCategoryModel.findByIdAndUpdate(VendorCategoryId, updateData, {
            new: true
        });
    }

    async deleteVendorCategory(VendorCategoryId: string): Promise<VendorCategory | null> {
        return await VendorCategoryModel.findByIdAndDelete(VendorCategoryId, {
            new: true
        });
    }

    // Additional category-specific methods...
}

export default new VendorCategoryRepository();
