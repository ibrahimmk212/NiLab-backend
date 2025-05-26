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
    async getAll(): Promise<Product[] | null> {
        return await ProductModel.find();
    }

    async searchProduct(query: any): Promise<Product[] | null> {
       // keys
         const keys = Object.keys(query);
            // values
        const values = Object.values(query);
        const search = keys.map((key, index) => {
            return { [key]: values[index] };
        });
        return await ProductModel.find({ $or: search });
    }
    async getAllByVendor(vendorId: string): Promise<Product[] | null> {
        // const total = await OrderModel.countDocuments();
        // const page = parseInt(data.page?.toString() || '1', 10);
        // const limit = parseInt(data.limit?.toString() || `${total}`, 10);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        return await ProductModel.find({ vendor: vendorId });

        // .skip(startIndex)
        // .limit(limit)
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

    // Additional product-specific methods...
}

export default new ProductRepository();
