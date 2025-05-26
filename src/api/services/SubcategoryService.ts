
import { Subcategory } from '../models/Subcategory';
import SubcategoryRepository from '../repositories/SubcategoryRepository';
import UserRepository from '../repositories/UserRepository';
import VendorRepository from '../repositories/VendorRepository';
interface ISubcategoryService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class SubcategoryService implements ISubcategoryService {
    async create(payload: Partial<any>): Promise<any> {
        const vendor = await VendorRepository.findByKey("userId", payload.userId)
        console.log(vendor)
        if (!vendor) {
            throw Error("Vendor not found!")
        }

        return SubcategoryRepository.createSubcategory({ ...payload, vendorId: vendor.id });
    }

    async find(id: string): Promise<any> {
        return SubcategoryRepository.findSubcategoryById(id);
    }
    async getAll(): Promise<any> {
        return SubcategoryRepository.getAll();
    }
}
export default new SubcategoryService();
