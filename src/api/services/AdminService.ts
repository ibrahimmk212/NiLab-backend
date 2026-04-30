import { Admin } from '../models/Admin';
import AdminRepository from '../repositories/AdminRepository';
import { CreateProductType } from '../types/product';

interface IAdminService {
    create(payload: any): Promise<any>;
    getAll(): Promise<any[]>;
    getByUserId(userId: string): Promise<any>;
    getById(id: string): Promise<any>;
    update(Id: string, data: Partial<Admin>): Promise<any>;
    delete(id: string): Promise<any>;
}

class AdminService implements IAdminService {
    async create(payload: any): Promise<any> {
        return AdminRepository.createAdmin(payload);
    }

    async find(id: string): Promise<any> {
        return AdminRepository.findAdminById(id);
    }
    async getByUserId(userId: string): Promise<Admin | null> {
        return AdminRepository.findAdminByUserId(userId);
    }
    async getById(id: string): Promise<any> {
        return AdminRepository.findAdminById(id);
    }
    async getAll(): Promise<any> {
        return AdminRepository.getAll();
    }
    async update(id: string, data: Partial<Admin>): Promise<any> {
        return await AdminRepository.updateAdmin(id, data);
    }
    async delete(id: string): Promise<any> {
        return await AdminRepository.deleteAdmin(id);
    }
}
export default new AdminService();
