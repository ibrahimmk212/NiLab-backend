import ProductRepository from '../repositories/ProductRepository';
import ProductModel, { Product } from '../models/Product';
import { CreateProductType } from '../types/product';

interface IProductService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
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
    async getAll(): Promise<any> {
        return ProductRepository.getAll();
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
