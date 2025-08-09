import ProductRepository from '../repositories/ProductRepository';
import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

interface IProductService {
    create(payload: any): Promise<any>;
    getAll(data: any): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class ProductService implements IProductService {
    async create(payload: CreateProductType): Promise<any> {
        return ProductRepository.createProduct(payload);
    }

    async findById(id: string): Promise<Product | null> {
        return ProductRepository.findProductById(id);
    }
    async getAll(data: any): Promise<any> {
        return ProductRepository.getAll(data);
    }
    async getAllByVendor(vendorId: any): Promise<Product[] | null> {
        return ProductRepository.getAllByVendor(vendorId);
    }

    async getAllByCategory(categoryId: any): Promise<Product[] | null> {
        return ProductRepository.getAllByCategory(categoryId);
    }
    async getProductsByOption(
        options: Record<string, unknown>,
        limit: number,
        page: number
    ): Promise<any> {
        return await ProductRepository.findProductsByOption(
            options,
            limit,
            page
        );
    }

    async searchProducts(
        search: string,
        limit: number,
        page: number,
        queryParams: any
    ): Promise<any> {
        return await ProductRepository.searchProducts(
            search,
            limit,
            page,
            queryParams
        );
    }
    async update(
        productId: string,
        updateData: Partial<Product>
    ): Promise<any> {
        return ProductRepository.updateProduct(productId, updateData);
    }
}
export default new ProductService();
