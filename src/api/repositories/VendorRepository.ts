/* eslint-disable @typescript-eslint/no-explicit-any */
import VendorModel, { BankAccount, Vendor } from '../models/Vendor';
import { CreateVendorType } from '../types/vendor';

interface FindAllVendorsOptions {
    page?: number;
    limit?: number;
    name?: string; // example filter
    marketCategoryId?: string; // example filter
    categories?: string[]; // example filter
    state?: string; // example filter
    lga?: string; // example filter
    ratings?: number; // example filter
    acceptDelivery?: boolean; // example filter
    openingHour?: string; // example filter
    closingHour?: string; // example filter
    isAvailable?: boolean; // example filter
    averageReadyTime?: number | string; // example filter
    email?: string; // example filter
    phoneNumber?: string; // example filter
    status?: string; // example filter
}
class VendorRepository {
    // Create a new vendor
    async createVendor(data: CreateVendorType): Promise<Vendor> {
        const vendor = new VendorModel(data);
        return await vendor.save();
    }

    // Find a vendor by ID
    async findById(vendorId: string): Promise<Vendor | null> {
        return await VendorModel.findById({ _id: vendorId }).populate([
            { path: 'products' },
            { path: 'categories' },
            { path: 'marketCategory' }
        ]);
    }
    async findByKey(key: string, value: string): Promise<Vendor | null> {
        return await VendorModel.findOne({ [key]: value }).populate([
            { path: 'products' },
            { path: 'categories' },
            { path: 'marketCategory' }
        ]);
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
            .populate({ path: 'products' });

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
    async findAllVendors(options: FindAllVendorsOptions) {
        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (options.marketCategoryId) {
            filter.marketCategoryId = options.marketCategoryId;
        }

        if (options.categories && options.categories.length > 0) {
            filter.categories = { $in: options.categories };
        }
        if (options.state) {
            filter.state = options.state;
        }
        if (options.lga) {
            filter.lga = options.lga;
        }
        if (options.ratings) {
            filter.ratings = { $gte: options.ratings };
        }
        if (options.acceptDelivery !== undefined) {
            filter.acceptDelivery = options.acceptDelivery;
        }
        if (options.openingHour) {
            filter.openingHour = options.openingHour;
        }
        if (options.closingHour) {
            filter.closingHour = options.closingHour;
        }
        if (options.isAvailable !== undefined) {
            filter.isAvailable = options.isAvailable;
        }
        if (options.averageReadyTime) {
            filter.averageReadyTime = options.averageReadyTime;
        }
        if (options.email) {
            filter.email = options.email;
        }
        if (options.phoneNumber) {
            filter.phoneNumber = options.phoneNumber;
        }

        if (options.name) {
            filter.name = { $regex: options.name, $options: 'i' };
        }

        if (options.status) {
            filter.status = options.status;
        }

        const [vendors, total] = await Promise.all([
            VendorModel.find(filter)
                .populate('categories marketCategory')
                .sort({ createdAt: -1 }) // Sort by createdAt descending
                .skip(skip)
                .limit(limit),
            VendorModel.countDocuments(filter)
        ]);

        return {
            total,
            count: vendors.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: vendors
        };
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
            .populate('categories marketCategory products');
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
