/* eslint-disable @typescript-eslint/no-explicit-any */
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

type UserRole = 'admin' | 'vendor' | 'user';

class ProductService implements IProductService {
    async create(payload: CreateProductType): Promise<any> {
        return await ProductRepository.createProduct(payload);
    }

    async findById(
        id: string,
        role: UserRole = 'user'
    ): Promise<Product | null> {
        return await ProductRepository.findProductById(id, role);
    }
    async getAll(data: any, role: UserRole = 'user'): Promise<any> {
        console.log('Service Data:', data);
        return await ProductRepository.getAll(data, role);
    }

    async update(
        productId: string,
        updateData: Partial<Product>
    ): Promise<any> {
        return await ProductRepository.updateProduct(productId, updateData);
    }

    async delete(productId: string): Promise<any> {
        return await ProductRepository.deleteProduct(productId);
    }
}
export default new ProductService();
