import AdminModel, { Admin } from '../models/Admin';

class AdminRepository {
    async createAdmin(data: Admin): Promise<Admin> {
        const admin = new AdminModel(data);
        return await admin.save();
    }

    async findAdminById(adminId: string): Promise<Admin | null> {
        return await AdminModel.findById(adminId).populate('userId');
    }
    async findAdminByUserId(userId: string): Promise<Admin | null> {
        return await AdminModel.findOne({ userId }).populate('userId');
    }
    async updateAdmin(
        adminId: string,
        updateData: Partial<Admin>
    ): Promise<Admin | null> {
        return await AdminModel.findByIdAndUpdate(adminId, updateData, {
            new: true
        }).populate('userId');
    }
    async getAll(): Promise<Admin[] | null> {
        return await AdminModel.find().sort({ name: 'asc' }).populate('userId');
    }
    async deleteAdmin(adminId: string): Promise<Admin | null> {
        return await AdminModel.findByIdAndDelete(adminId, {
            new: true
        }).populate('userId');
    }

    // Additional admin-specific methods...
}

export default new AdminRepository();
