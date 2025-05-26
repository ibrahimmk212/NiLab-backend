import AdminModel, { Admin } from '../models/Admin';

class AdminRepository {
    async createAdmin(data: Admin): Promise<Admin> {
        const admin = new AdminModel(data);
        return await admin.save();
    }

    async findAdminById(adminId: string): Promise<Admin | null> {
        return await AdminModel.findById(adminId);
    }

    async updateAdmin(
        adminId: string,
        updateData: Partial<Admin>
    ): Promise<Admin | null> {
        return await AdminModel.findByIdAndUpdate(adminId, updateData, {
            new: true
        });
    }
    async getAll(): Promise<Admin[] | null> {
        return await AdminModel.find();
    }
    async deleteAdmin(adminId: string): Promise<Admin | null> {
        return await AdminModel.findByIdAndDelete(adminId, {
            new: true
        });
    }

    // Additional admin-specific methods...
}

export default new AdminRepository();
