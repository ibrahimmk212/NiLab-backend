import ProductRepository from '../repositories/ProductRepository';
import { GetAllQuery, PaginatedResult } from '../interfaces';
import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

interface IProductService {
    create(payload: any): Promise<any>;
    getAll(query: GetAllQuery): Promise<PaginatedResult>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class ProductService implements IProductService {
    async create(payload: CreateProductType): Promise<any> {
        return ProductRepository.createProduct(payload);
    }

    async findById(id: string): Promise<any> {
        return ProductRepository.findProductById(id);
    }
    async search(query: any): Promise<any> {
        return ProductRepository.searchProduct(query);
    }
    async getAll(query: GetAllQuery): Promise<PaginatedResult> {
        return ProductRepository.getAll(query);
    }
    async getAllByVendor(vendorId: any): Promise<Product[] | null> {
        return ProductRepository.getAllByVendor(vendorId);
    }

    async getAllByCategory(categoryId: any): Promise<Product[] | null> {
        return ProductRepository.getAllByCategory(categoryId);
    }
    async update(
        productId: string,
        updateData: Partial<Product>
    ): Promise<any> {
        return ProductRepository.updateProduct(productId, updateData);
    }
}
export default new ProductService();
