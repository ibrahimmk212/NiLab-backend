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
            'products categories'
        );
    }
    async findByKey(key: string, value: string): Promise<Vendor | null> {
        return await VendorModel.findOne({ [key]: value });
    }
    // find vendors options
    async findVendorsByOption(
        options: Record<string, unknown>,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await VendorModel.countDocuments(options);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const vendors = await VendorModel.find(options)
            .skip(startIndex)
            .limit(limit)
            .populate('categories');

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { vendors, count: vendors.length, pagination, total };
    }

    // find nearby vendors
    async findNearbyVendors(
        longitude: number,
        latitude: number,
        maxDistance: number
    ): Promise<Vendor[]> {
        const vendors = await VendorModel.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'distance',
                    maxDistance: maxDistance,
                    spherical: true
                }
            },
            {
                $lookup: {
                    from: 'categories', // The collection to join
                    localField: 'categories', // Field from the vendors collection
                    foreignField: '_id', // Field from the categories collection
                    as: 'categories' // The array field to add to the result, containing the joined documents
                }
            }
            // Optionally add other aggregation stages
        ]);
        return vendors;
    }
    // Find all vendor
    async findAllVendors(): Promise<Vendor[] | null> {
        const vendors = await VendorModel.find().populate('categories');

        return vendors;
    }

    async searchVendors(search: string, limit = 10, page = 1): Promise<any> {
        const searchQuery =
            search && search !== '' ? { $text: { $search: search } } : {};

        const total = await VendorModel.countDocuments(searchQuery);

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const vendors = await VendorModel.find(searchQuery)
            .skip(startIndex)
            .limit(limit)
            .populate('categories');

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { vendors, count: vendors.length, pagination, total };
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
