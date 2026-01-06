/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import CategoryModel, { Category } from '../models/Category';

type UserRole = 'admin' | 'vendor' | 'user';

class CategoryRepository {
    async createCategory(data: any): Promise<Category> {
        // 1. Check uniqueness (Case-Insensitive) for the specific vendor
        const existingCategory = await CategoryModel.findOne({
            name: { $regex: new RegExp(`^${data.name}$`, 'i') },
            vendor: data.vendor,
            isDeleted: false // Allow re-creating if the old one was deleted
        });

        if (existingCategory) {
            throw new Error(
                'Category with this name already exists for this vendor'
            );
        }

        const category = new CategoryModel(data);
        return await category.save();
    }

    /**
     * Standard fetch - Usually used by Admin or Internal processes
     */
    async findCategoryById(categoryId: string): Promise<Category | null> {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) return null;
        return await CategoryModel.findById(categoryId);
    }

    /**
     * Public fetch - Only returns categories that are actually usable
     */
    async findActiveCategoryById(categoryId: string): Promise<Category | null> {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) return null;
        return await CategoryModel.findOne({
            _id: categoryId,
            status: 'active',
            isDeleted: false
        });
    }

    async findAll(options: any, role: UserRole = 'user') {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        // 1. Visibility Filter
        if (role !== 'admin') {
            filter.isDeleted = false;
            filter.status = 'active';
        }

        if (options.vendor) filter.vendor = options.vendor;
        if (options.status) filter.status = options.status;
        if (options.name) filter.name = { $regex: options.name, $options: 'i' };

        const [categories, total] = await Promise.all([
            CategoryModel.find(filter)
                .populate({
                    path: 'vendor',
                    select: 'name email status'
                })
                .sort({ name: 1 }) // Categories are usually better sorted alphabetically
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
            new: true,
            runValidators: true
        });
    }

    async deleteCategory(categoryId: string): Promise<Category | null> {
        // Soft delete: marks as inactive and deleted
        return await CategoryModel.findByIdAndUpdate(
            categoryId,
            {
                status: 'inactive',
                isDeleted: true,
                deletedAt: new Date()
            },
            { new: true }
        );
    }
}

export default new CategoryRepository();
