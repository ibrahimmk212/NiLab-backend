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
    async getAll(): Promise<Product[] | null> {
        return await ProductModel.find()
            .populate('category vendor')
            .sort({ name: 'asc' });
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
