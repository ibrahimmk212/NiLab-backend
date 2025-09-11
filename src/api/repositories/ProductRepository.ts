import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

class ProductRepository {
    async createProduct(data: CreateProductType): Promise<Product> {
        const product = new ProductModel(data);
        return await product.save();
    }

    async findProductById(productId: string): Promise<Product | null> {
        return await ProductModel.findById(productId).populate(
            'category vendor'
        );
    }
    // async getAll(): Promise<Product[] | null> {
    //     return await ProductModel.find()
    //         .populate('category vendor')
    //         .sort({ name: 'asc' });
    // }

    // Find all vendor
    async getAll(options: any) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.vendorId) {
            filter.vendor = options.vendorId;
        }
        if (options.categoryId) {
            filter.category = options.categoryId;
        }
        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }
        if (options.status) {
            filter.status = options.status;
        }
        if (options.search) {
            filter.$text = { $search: options.search };
        }
        if (options.available !== undefined) {
            filter.available = options.available;
        }
        if (options.ratings) {
            filter.ratings = { $gte: options.ratings };
        }
        if (options.price) {
            filter.price = { $gte: options.price };
        }
        if (options.description) {
            filter.description = { $regex: options.description, $options: 'i' };
        }
        if (options.images) {
            filter.images = { $exists: true, $ne: [] };
        }
        if (options.thumbnail) {
            filter.thumbnail = { $exists: true, $ne: '' };
        }
        if (options.createdAt) {
            filter.createdAt = { $gte: new Date(options.createdAt) };
        }
        if (options.updatedAt) {
            filter.updatedAt = { $gte: new Date(options.updatedAt) };
        }
        if (options.sortBy) {
            filter.sortBy = options.sortBy;
        }
        if (options.sortOrder) {
            filter.sortOrder = options.sortOrder;
        }

        const [products, total] = await Promise.all([
            ProductModel.find(filter)
                .populate('category vendor')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
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

    async getAllByVendor(vendorId: string): Promise<Product[] | null> {
        // const total = await OrderModel.countDocuments();
        // const page = parseInt(data.page?.toString() || '1', 10);
        // const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        return await ProductModel.find({ vendor: vendorId })
            .populate('category vendor favourites')
            .sort({ name: 'asc' });

        // .skip(startIndex)
        // .limit(limit)
    }

    async getAllByCategory(categoryId: any): Promise<Product[] | null> {
        return await ProductModel.find({ category: categoryId })
            .populate('category vendor')
            .sort({ name: 'asc' });
    }

    async searchProducts(
        search: string,
        limit = 10,
        page = 1,
        queryParams: any
    ): Promise<any> {
        const searchQuery =
            search && search !== '' ? { $text: { $search: search } } : {};

        const query = {
            ...searchQuery,
            ...queryParams
        };

        const total = await ProductModel.countDocuments(query);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const products = await ProductModel.find(query)
            .populate('category vendor favourites')
            .sort({ name: 'asc' })
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { products, count: products.length, pagination, total };
    }
    async findProductsByOption(
        options: Record<string, unknown>,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await ProductModel.countDocuments(options);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const products = await ProductModel.find(options)
            .populate('category vendor favourites')
            .sort({ name: 'asc' })
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { products, count: products.length, pagination, total };
    }
    async updateProduct(
        productId: string,
        updateData: Partial<Product>
    ): Promise<Product | null> {
        return await ProductModel.findByIdAndUpdate(productId, updateData, {
            new: true
        }).populate('category vendor');
    }

    async deleteProduct(productId: string): Promise<Product | null> {
        return await ProductModel.findByIdAndDelete(productId, { new: true });
    }

    // Additional product-specific methods...
}

export default new ProductRepository();
