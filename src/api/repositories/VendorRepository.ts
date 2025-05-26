import { Category } from '../models/Category';
import VendorModel, { BankAccount, Vendor } from '../models/Vendor';
import { CreateVendorType } from '../types/vendor';

class VendorRepository {
    // Create a new vendor
    async createVendor(data: CreateVendorType): Promise<Vendor> {
        const vendor = new VendorModel(data);
        return await vendor.save();
    }

    // Find a vendor by ID
    async findById(vendorId: string): Promise<Vendor | null> {
        return await VendorModel.findById({ _id: vendorId }).populate(
            'products'
        );
    }
    async findByKey(key: string, value: string): Promise<Vendor | null> {
        return await VendorModel.findOne({ [key]: value });
    }
    // find vendors options
    async findVendorsByOption(
        options: Record<string, unknown>
    ): Promise<Vendor[] | null> {
        return await VendorModel.find(options);
    }

    // find vendors by category
    async findVendorsByCategory(categoryId: string): Promise<Vendor[] | null> {
        return await VendorModel.find({ categories: categoryId }).populate(
            'categories'
        );
    }

    // find nearby vendors
    async findNearbyVendors(
        longitude: number,
        latitude: number,
        maxDistance: number
    ): Promise<Vendor[]> {
        return await VendorModel.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distance',
                    maxDistance: maxDistance,
                    spherical: true
                }
            }
            // Optionally add other aggregation stages
        ]);

        // VendorModel.find({
        //     location: {
        //         $nearSphere: {
        //             $geometry: {
        //                 type: 'Point',
        //                 coordinates: [longitude, latitude]
        //             },
        //             $maxDistance: maxDistance
        //         }
        //     }
        //     // status: 'active'
        // });
    }
    // Find all vendor
    async findAllVendors(): Promise<Vendor[] | null> {
        return await VendorModel.find().populate('categories');
    }
    // Update a vendor by ID
    async update(
        vendorId: string,
        updateData: Partial<Vendor>
    ): Promise<Vendor | null> {
        return await VendorModel.findByIdAndUpdate(vendorId, updateData, {
            new: true
        });
    }
    async updateBank(
        vendorId: string,
        updateData: Partial<BankAccount>
    ): Promise<Vendor | null> {
        return await VendorModel.findByIdAndUpdate(
            vendorId,
            {
                // $set: {
                //     'bankAccount.$': updateData
                // }
                bankAccount: updateData
            },
            {
                new: true
            }
        );
    }

    async updateLocation(
        vendorId: string,
        updateData: any //Partial<BankAccount>
    ): Promise<Vendor | null> {
        return await VendorModel.findByIdAndUpdate(
            vendorId,
            {
                // $set: {
                //     'bankAccount.$': updateData
                // }
                location: { coordinates: updateData.coordinates },
                status: updateData?.status
            },
            {
                new: true
            }
        );
    }
    // Delete a vendor
    async deleteVendor(vendorId: string): Promise<Vendor | null> {
        return await VendorModel.findByIdAndDelete(vendorId, { new: true });
    }

    async addNewCategory(
        vendorId: string,
        categoryId: string
    ): Promise<Vendor | null> {
        return await VendorModel.findByIdAndUpdate(
            vendorId,
            { $push: { categories: categoryId } },
            { new: true, safe: true, upsert: true }
        );
    }

    // async deleteCategory(
    //     vendorId: string,
    //     categoryId: string
    // ): Promise<Vendor | null> {
    //     return await VendorModel.findByIdAndUpdate(
    //         vendorId,
    //         { $pull: { categories: { _id: categoryId } } },
    //         { new: true }
    //     );
    // }
}

export default new VendorRepository();
