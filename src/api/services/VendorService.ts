/* eslint-disable @typescript-eslint/no-explicit-any */
import VendorRepository from '../repositories/VendorRepository';
import { Vendor } from '../models/Vendor';
import { CreateVendorType } from '../types/vendor';

interface IVendorService {
    create(payload: CreateVendorType): Promise<any>;
    getAll(data: any): Promise<Vendor[] | null>;
    get(vendorId: string): Promise<any>;
    update(vendorId: string, data: any): Promise<any>;
    // deleteVendor(vendorId: string): Promise<boolean>;
}

class VendorService implements IVendorService {
    async create(payload: CreateVendorType): Promise<any> {
        return VendorRepository.createVendor(payload);
    }

    async getByUserId(userId: string) {
        const vendor = await VendorRepository.findByKey('userId', userId);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    }

    async getById(id: string) {
        const vendor = await VendorRepository.findById(id);
        if (!vendor) {
            throw new Error('Vendor not found');
        }
        return vendor;
    }
    async getAll(data: any): Promise<any> {
        return await VendorRepository.findAllVendors(data);
    }

    // nearby vendors
    async getNearbyVendors(
        longitude: number,
        latitude: number,
        maxDistance: number,
        options: Record<string, unknown> = {}
    ): Promise<Vendor[]> {
        return await VendorRepository.findNearbyVendors(
            longitude,
            latitude,
            maxDistance,
            options
        );
    }
    // find vendors options
    async getVendorsByOption(
        options: Record<string, unknown>,
        limit: number,
        page: number
    ): Promise<any> {
        return await VendorRepository.findVendorsByOption(options, limit, page);
    }

    async searchVendors(
        search: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await VendorRepository.searchVendors(search, limit, page);
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

        // 1. Update Vendor Location
        const updatedVendor = await VendorRepository.updateLocation(vendorId, payload);
        
        if (updatedVendor && updatedVendor.userId) {
            const { default: UserRepository } = await import('../repositories/UserRepository');
            
            // 2. Sync with User Address (Enforce single address for Vendor)
            const locationData = payload;
            const syncedAddress = {
                address: locationData.formattedAddress || locationData.address,
                street: locationData.street,
                city: locationData.city,
                state: locationData.state,
                postcode: locationData.zipcode || locationData.postcode,
                buildingNumber: locationData.buildingNumber,
                coordinates: locationData.coordinates, // [lng, lat]
                label: 'Shop/Home',
                isDefault: true
            };

            // Update user addresses array to contain ONLY this address
            await UserRepository.updateUser(updatedVendor.userId.toString(), {
                addresses: [syncedAddress] as any
            });
        }

        return updatedVendor;
    }
}

export default new VendorService();
