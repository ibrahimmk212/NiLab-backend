import { GetAllQuery, PaginatedResult } from '../interfaces';
import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

class ProductRepository {
    async createProduct(data: CreateProductType): Promise<Product> {
        const product = new ProductModel(data);
        return await product.save();
    }

    async findProductById(productId: string): Promise<Product | null> {
        return await ProductModel.findById(productId);
    }

    async getAll(query: GetAllQuery): Promise<PaginatedResult> {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
            filters = {}
        } = query;

        const skip = (page - 1) * limit;

        const filterConditions: any = { ...filters };

        if (search) {
            filterConditions.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const totalCount = await ProductModel.countDocuments(filterConditions);
        const totalPages = Math.ceil(totalCount / limit);

        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const data = await ProductModel.find(filterConditions)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate('vendor');

        return {
            data,
            totalCount,
            totalPages,
            currentPage: page
        };
    }

    async searchProduct(query: any): Promise<Product[] | null> {
        const keys = Object.keys(query);
        const values = Object.values(query);
        const search = keys.map((key, index) => {
            return { [key]: values[index] };
        });
        return await ProductModel.find({ $or: search });
    }

    async getAllByVendor(vendorId: string): Promise<Product[] | null> {
        return await ProductModel.find({ vendor: vendorId });
    }

    async getAllByCategory(categoryId: any): Promise<Product[] | null> {
        return await ProductModel.find({ category: categoryId });
    }

    async updateProduct(
        productId: string,
        updateData: Partial<Product>
    ): Promise<Product | null> {
        return await ProductModel.findByIdAndUpdate(productId, updateData, {
            new: true
        });
    }

    async deleteProduct(productId: string): Promise<Product | null> {
        return await ProductModel.findByIdAndDelete(productId, { new: true });
    }
}

export default new ProductRepository();
