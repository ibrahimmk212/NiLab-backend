import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

class ProductRepository {
    async createProduct(data: CreateProductType): Promise<Product> {
        const product = new ProductModel(data);
        return await product.save();
    }

    async findProductById(productId: string): Promise<Product | null> {
        return await ProductModel.findById(productId).populate('vendor');
    }

    async getAll(): Promise<Product[] | null> {
        return await ProductModel.find().populate('vendor');
    }

    async searchProduct(query: any): Promise<Product[] | null> {
        const keys = Object.keys(query);
        const values = Object.values(query);
        const search = keys.map((key, index) => {
            return { [key]: values[index] };
        });
        return await ProductModel.find({ $or: search }).populate('vendor');
    }

    async getAllByVendor(vendorId: string): Promise<Product[] | null> {
        return await ProductModel.find({ vendor: vendorId }).populate('vendor');
    }

    async getAllByCategory(categoryId: any): Promise<Product[] | null> {
        return await ProductModel.find({ category: categoryId }).populate('vendor');
    }

    async updateProduct(
        productId: string,
        updateData: Partial<Product>
    ): Promise<Product | null> {
        return await ProductModel.findByIdAndUpdate(productId, updateData, {
            new: true
        }).populate('vendor');
    }

    async deleteProduct(productId: string): Promise<Product | null> {
        return await ProductModel.findByIdAndDelete(productId, { new: true }).populate('vendor');
    }
}

export default new ProductRepository();
