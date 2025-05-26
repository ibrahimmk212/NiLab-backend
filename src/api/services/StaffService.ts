import * as bcrypt from 'bcrypt';
import StaffRepository from '../repositories/StaffRepository';
import { Staff } from '../models/Staff';

interface IStaffService {
    createStaff(payload: any): Promise<any>;
    getStaffs(): Promise<any[]>;
    getStaffDetail(staffId: string): Promise<any>;
    updateStaff(staffId: string, data: any): Promise<boolean>;
    deleteStaff(staffId: string): Promise<boolean>;
}

class StaffService {
    async createStaff(payload: any): Promise<any> {
        const staff = await StaffRepository.findStaffByKey(
            'staffId',
            payload.staffId
        );

        if (staff) {
            throw new Error('Staff Already Exist');
        }

        // const hashedPassword = bcrypt.hashSync(payload.password, 5);

        return StaffRepository.createStaff({
            ...payload
        });
    }
    async findById(id: string) {
        const staff = await StaffRepository.findStaffById(id);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return staff;
    }
    async findAllByKey(key: string, val: string) {
        const staff = await StaffRepository.findAllByKey(key, val);
        if (!staff) {
            throw new Error('Staff not found');
        }
        return staff;
    }

    getStaffs(): Promise<any[]> {
        throw new Error('Method not implemented.');
    }

    async getStaffDetail(staffId: string): Promise<Staff> {
        const staff = await StaffRepository.findStaffById(staffId);

        if (!staff) {
            throw new Error('Staff not found');
        }

        return staff;
    }

    async updateStaff(staffId: string, payload: any): Promise<Staff | null> {
        const staff = await StaffRepository.findStaffById(staffId);

        if (!staff) {
            throw new Error('Staff not found');
        }

        return StaffRepository.updateStaff(staffId, payload);
    }

    async deleteStaff(staffId: string): Promise<Staff | null> {
        const staff = await StaffRepository.findStaffById(staffId);

        if (!staff) {
            throw new Error('Staff not found');
        }

        return StaffRepository.deleteStaff(staffId);
    }
}

export default new StaffService();
