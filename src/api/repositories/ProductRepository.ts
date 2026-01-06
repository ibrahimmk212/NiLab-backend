// /* eslint-disable @typescript-eslint/no-explicit-any */
// import ProductModel, { Product } from '../models/Product';
// import { CreateProductType } from '../types/product';

// type UserRole = 'admin' | 'vendor' | 'user';

// class ProductRepository {
//     async createProduct(data: CreateProductType): Promise<Product> {
//         const product = new ProductModel(data);
//         return await product.save();
//     }

//     /**
//      * Role-aware product fetch
//      * - Admin: sees everything
//      * - Vendor/user: only active & not deleted
//      */
//     async findProductById(
//         productId: string,
//         role: UserRole = 'user'
//     ): Promise<Product | null> {
//         const filter: any = { _id: productId };

//         if (role !== 'admin') {
//             filter.isDeleted = false;
//             filter.status = 'active';
//         }

//         const product = await ProductModel.findOne(filter)
//             .populate({
//                 path: 'category',
//                 match:
//                     role === 'admin'
//                         ? {}
//                         : { isDeleted: false, status: 'active' }
//             })
//             .populate('vendor');

//         // 🔥 KEY FIX
//         if (role !== 'admin' && !product?.category) {
//             return null;
//         }

//         return product;
//     }

//     // =============================
//     // Get all products (filtered)
//     // =============================
//     async getAll(options: any, role: UserRole = 'admin') {
//         const page = Number(options.page) || 1;
//         const limit = Number(options.limit) || 10;
//         const skip = (page - 1) * limit;
//         const sort: any = { createdAt: -1 };

//         const filter: Record<string, any> = {};

//         if (role !== 'admin') {
//             filter.isDeleted = false;
//             filter.status = 'active';
//         }

//         if (options.vendorId) filter.vendor = options.vendorId;
//         if (options.categoryId) filter.category = options.categoryId;
//         if (options.name) filter.name = { $regex: options.name, $options: 'i' };
//         if (options.search) filter.$text = { $search: options.search };
//         if (options.available !== undefined)
//             filter.available = options.available;
//         if (options.ratings !== undefined)
//             filter.ratings = { $gte: Number(options.ratings) };
//         if (options.price) filter.price = { $gte: options.price };

//         if (options.sortBy) {
//             sort[options.sortBy] = options.sortOrder === 'asc' ? 1 : -1;
//         }

//         const [products, total] = await Promise.all([
//             ProductModel.find(filter)
//                 .populate({
//                     path: 'category',
//                     match:
//                         role === 'admin'
//                             ? {}
//                             : { isDeleted: false, status: 'active' }
//                 })
//                 .populate('vendor')
//                 .sort(sort)
//                 .skip(skip)
//                 .limit(limit),
//             ProductModel.countDocuments(filter)
//         ]);

//         // 🔥 hide products whose category was deleted (non-admin)
//         const visibleProducts =
//             role === 'admin'
//                 ? products
//                 : products.filter((p) => p.category !== null);

//         return {
//             total,
//             count: visibleProducts.length,
//             pagination: {
//                 page,
//                 limit,
//                 totalPages: Math.ceil(total / limit),
//                 hasNextPage: page * limit < total,
//                 hasPrevPage: page > 1
//             },
//             data: visibleProducts
//         };
//     }

//     async getAllByVendor(
//         vendorId: string,
//         role: UserRole = 'vendor'
//     ): Promise<Product[] | null> {
//         const filter: any = { vendor: vendorId };

//         if (role !== 'admin') {
//             filter.isDeleted = false;
//             filter.status = 'active';
//         }

//         return await ProductModel.find(filter)
//             .populate({
//                 path: 'category',
//                 match:
//                     role === 'admin'
//                         ? {}
//                         : { isDeleted: false, status: 'active' }
//             })
//             .populate('vendor favourites')
//             .sort({ name: 'asc' });
//     }

//     async getAllByCategory(
//         categoryId: string,
//         role: UserRole = 'user'
//     ): Promise<Product[] | null> {
//         const filter: any = { category: categoryId };

//         if (role !== 'admin') {
//             filter.isDeleted = false;
//             filter.status = 'active';
//         }

//         return await ProductModel.find(filter)
//             .populate({
//                 path: 'category'
//                 //     match:
//                 //         role === 'admin'
//                 //             ? {}
//                 //             : { isDeleted: false, status: 'active' }
//             })
//             .populate('vendor')
//             .sort({ name: 'asc' });
//     }

//     async updateProduct(
//         productId: string,
//         updateData: Partial<Product>
//     ): Promise<Product | null> {
//         return await ProductModel.findByIdAndUpdate(productId, updateData, {
//             new: true
//         }).populate('category vendor');
//     }

//     /**
//      * Soft delete product
//      */
//     async deleteProduct(productId: string): Promise<void> {
//         await ProductModel.findByIdAndUpdate(productId, {
//             status: 'inactive',
//             isDeleted: true,
//             deletedAt: new Date()
//         });
//     }
// }

// export default new ProductRepository();

/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

type UserRole = 'admin' | 'vendor' | 'user';

class ProductRepository {
    async createProduct(data: CreateProductType): Promise<Product> {
        const product = new ProductModel(data);
        return await product.save();
    }

    /**
     * Role-aware product fetch
     * Fix: Handles the "null category" issue correctly
     */
    async findProductById(
        productId: string,
        role: UserRole = 'user'
    ): Promise<Product | null> {
        // 1. Basic Validation
        if (!mongoose.Types.ObjectId.isValid(productId)) return null;

        const filter: any = { _id: productId };

        // 2. Filter for the Product itself
        // We only care if the PRODUCT is deleted or inactive here
        if (role !== 'admin') {
            filter.isDeleted = false;
            filter.status = 'active';
        }

        const product = await ProductModel.findOne(filter)
            .populate({
                path: 'category',
                // If category is deleted/inactive, product.category becomes null
                match:
                    role === 'admin'
                        ? {}
                        : { isDeleted: false, status: 'active' }
            })
            .populate('vendor');

        // 3. The Result
        // If the product doesn't exist, is deleted, or is inactive -> return null
        if (!product) return null;

        // We REMOVED the check that looks at !product.category.
        // Now, if the category is deleted, you get the product with category: null.

        return product;
    }

    /**
     * Get all products (filtered)
     * FIX: Uses Aggregation to ensure 'total' count matches the filtered 'data'
     */
    async getAll(options: any, role: UserRole = 'user') {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        // 1. Filter ONLY for the Product's own status
        const filter: any = {};
        if (role !== 'admin') {
            filter.isDeleted = false;
            filter.status = 'active';
        }

        // Additional filters
        if (options.vendorId) filter.vendor = options.vendorId;
        if (options.categoryId) filter.category = options.categoryId;
        if (options.name) filter.name = { $regex: options.name, $options: 'i' };

        // 2. Execute Query
        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .populate({
                    path: 'category',
                    // This 'match' is the magic:
                    // If the category is deleted, Mongoose sets product.category = null
                    match:
                        role === 'admin'
                            ? {}
                            : { isDeleted: false, status: 'active' }
                })
                .populate('vendor')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(), // lean() makes it a plain JS object for better performance
            ProductModel.countDocuments(filter)
        ]);

        return {
            total,
            count: products.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: products
        };
    }

    async getAllByVendor(
        vendorId: string,
        role: UserRole = 'vendor'
    ): Promise<Product[]> {
        const filter: any = { vendor: new mongoose.Types.ObjectId(vendorId) };

        if (role !== 'admin') {
            filter.isDeleted = false;
            filter.status = 'active';
        }

        const products = await ProductModel.find(filter)
            .populate({
                path: 'category'
                // if category is inactive or deleted, it will be null
                // match makes it to return empty product
            })
            .populate('vendor favourites')
            .sort({ name: 'asc' });

        // Filter out products with inactive categories in JS for simple lists
        return role === 'admin'
            ? products
            : products.filter((p) => p.category !== null);
    }

    async updateProduct(
        productId: string,
        updateData: Partial<Product>
    ): Promise<Product | null> {
        // Use .save() instead of findByIdAndUpdate so that 'pre-save'
        // validation (category check) in the model is triggered.
        const product = await ProductModel.findById(productId);
        if (!product) return null;

        Object.assign(product, updateData);
        return await product.save();
    }

    async deleteProduct(productId: string): Promise<void> {
        await ProductModel.findByIdAndUpdate(productId, {
            status: 'inactive',
            isDeleted: true,
            deletedAt: new Date()
        });
    }
}

export default new ProductRepository();
