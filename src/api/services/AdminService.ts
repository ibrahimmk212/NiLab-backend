import { Admin } from '../models/Admin';
import AdminRepository from '../repositories/AdminRepository';
import { CreateProductType } from '../types/product';

interface IAdminService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    // get(Id: string): Promise<any>;
    // update(Id: string, data: any): Promise<boolean>;
    // delete(userId: string): Promise<boolean>;
}

class AdminService implements IAdminService {
    async create(payload: any): Promise<any> {
        return AdminRepository.createAdmin(payload);
    }

    async find(id: string): Promise<any> {
        return AdminRepository.findAdminById(id);
    }
    async getAll(): Promise<any> {
        return AdminRepository.getAll();
    }
}
export default new AdminService();
