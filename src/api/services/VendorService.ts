import * as bcrypt from 'bcrypt';
import VendorRepository from '../repositories/VendorRepository';
import { Vendor } from '../models/Vendor';
import { CreateVendorType } from '../types/vendor';

interface IVendorService {
    create(payload: Vendor): Promise<any>;
    getAll(data: any): Promise<Vendor[] | null>;
    get(vendorId: string): Promise<any>;
    update(vendorId: string, data: any): Promise<boolean>;
    // deleteVendor(vendorId: string): Promise<boolean>;
}

class VendorService implements IVendorService {
    async create(payload: CreateVendorType): Promise<any> {
        return VendorRepository.createVendor(payload);
    }
    async getById(id: string) {
        const vendor = await VendorRepository.findById(id);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    }
    async getAll(): Promise<Vendor[] | null> {
        return await VendorRepository.findAllVendors();
    }

    // nearby vendors
    async getNearbyVendors(
        longitude: number,
        latitude: number,
        maxDistance: number
    ): Promise<Vendor[]> {
        return await VendorRepository.findNearbyVendors(
            longitude,
            latitude,
            maxDistance
        );
    }
    // find vendors options
    async getVendorsByOption(
        options: Record<string, unknown>
    ): Promise<Vendor[] | null> {
        return await VendorRepository.findVendorsByOption(options);
    }

    async getVendorsByCategory(categoryId: string): Promise<Vendor[] | null> {
        return await VendorRepository.findVendorsByCategory(categoryId);
    }
    async get(vendorId: string): Promise<any> {
        const vendor = await VendorRepository.findById(vendorId);

        if (!vendor) {
            throw new Error('Vendor not found');
        }

        return vendor;
    }

    async update(vendorId: string, payload: any): Promise<any> {
        const vendor = await VendorRepository.findById(vendorId);

        if (!vendor) {
            throw new Error('Vendor not found');
        }

        return VendorRepository.update(vendorId, payload);
    }

    async addCategory(
        vendorId: string,
        categoryId: string
    ): Promise<Vendor | null> {
        return await VendorRepository.addNewCategory(vendorId, categoryId);
    }
    async updateBank(vendorId: string, payload: any): Promise<Vendor | null> {
        const vendor = await VendorRepository.findById(vendorId);

        if (!vendor) {
            throw new Error('Vendor not found');
        }

        return VendorRepository.updateBank(vendorId, payload);
    }
    async updateLocation(
        vendorId: string,
        payload: any
    ): Promise<Vendor | null> {
        const vendor = await VendorRepository.findById(vendorId);

        if (!vendor) {
            throw new Error('Vendor not found');
        }

        return VendorRepository.updateLocation(vendorId, payload);
    }
}

export default new VendorService();
