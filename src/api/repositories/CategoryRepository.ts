import CategoryModel, { Category } from '../models/Category';

class CategoryRepository {
    async createCategory(data: Category): Promise<Category> {
        // create only when name is unique for a vendor
        const existingCategory = await CategoryModel.exists({
            name: data.name,
            vendor: data.vendor
        });
        if (existingCategory) {
            throw new Error(
                'Category with this name already exists for this vendor'
            );
        }
        const category = new CategoryModel(data);
        return await category.save();
    }

    async findCategoryById(categoryId: string): Promise<Category | null> {
        return await CategoryModel.findById(categoryId);
    }

    async findActiveCategoryById(categoryId: string): Promise<Category | null> {
        return await CategoryModel.findOne({
            _id: categoryId,
            status: 'active'
        });
    }

    async findAll(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.vendor) {
            filter.vendor = options.vendor;
        }

        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }

        if (options.status) {
            filter.status = options.status;
        }

        const [categories, total] = await Promise.all([
            CategoryModel.find(filter)
                .populate({
                    path: 'vendor',
                    select: 'name email status'
                })
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            CategoryModel.countDocuments(filter)
        ]);

        return {
            total,
            count: categories.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: categories
        };
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
