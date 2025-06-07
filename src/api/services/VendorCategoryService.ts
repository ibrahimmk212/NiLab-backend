import { VendorCategory } from '../models/VendorCategory';
import VendorCategoryRepository from '../repositories/VendorCategoryRepository'; 
interface IVendorCategoryService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class VendorCategoryService implements IVendorCategoryService {
    async create(payload: VendorCategory): Promise<any> {
        return await VendorCategoryRepository.createVendorCategory(payload);
    }

    async update(Id: string, data: any): Promise<any> {
        return await VendorCategoryRepository.updateVendorCategory(Id, data);
    }

    async find(id: string): Promise<any> {
        return await VendorCategoryRepository.findVendorCategoryById(id);
    }
    async getAll(): Promise<any> {
        return await VendorCategoryRepository.getAll();
    }
}
export default new VendorCategoryService();
