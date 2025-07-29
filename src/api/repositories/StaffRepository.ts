import StaffModel, { Staff } from '../models/Staff';

class StaffRepository {
    async createStaff(data: Staff): Promise<Staff> {
        const staff = new StaffModel(data);
        return await staff.save();
    }

    async findStaffById(staffId: string): Promise<Staff | null> {
        return await StaffModel.findById(staffId);
    }
    // Find a user by email
    async findStaffByKey(key: string, value: string): Promise<Staff | null> {
        return await StaffModel.findOne({ [key]: value }).populate({
            path: 'vendor user'
            // select: ' -userId'
        });
    }
    async findAll(key: string, value: string): Promise<Staff[] | null> {
        return await StaffModel.find().populate({
            path: 'vendor user'
            // select: ' -userId'
        });
    }
    async findAllByKey(key: string, value: string): Promise<Staff[] | null> {
        return await StaffModel.find({ [key]: value }).populate({
            path: 'user'
            // select: ' -userId'
        });
    }
    async updateStaff(
        staffId: string,
        updateData: Partial<Staff>
    ): Promise<Staff | null> {
        return await StaffModel.findByIdAndUpdate(staffId, updateData, {
            new: true
        });
    }

    async deleteStaff(staffId: string): Promise<Staff | null> {
        return await StaffModel.findByIdAndDelete(staffId, {
            new: true
        });
    }
}

export default new StaffRepository();
