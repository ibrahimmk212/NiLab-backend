"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vendor_1 = __importDefault(require("../models/Vendor"));
class VendorRepository {
    // Create a new vendor
    async createVendor(data) {
        const vendor = new Vendor_1.default(data);
        return await vendor.save();
    }
    // Find a vendor by ID
    async findById(vendorId) {
        return await Vendor_1.default.findById({ _id: vendorId }).populate('products');
    }
    async findByKey(key, value) {
        return await Vendor_1.default.findOne({ [key]: value });
    }
    // find vendors options
    async findVendorsByOption(options) {
        return await Vendor_1.default.find(options);
    }
    // find vendors by category
    async findVendorsByCategory(categoryId) {
        return await Vendor_1.default.find({ categories: categoryId }).populate('categories');
    }
    // find nearby vendors
    async findNearbyVendors(longitude, latitude, maxDistance) {
        return await Vendor_1.default.aggregate([
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
    async findAllVendors() {
        return await Vendor_1.default.find().populate('categories');
    }
    // Update a vendor by ID
    async update(vendorId, updateData) {
        return await Vendor_1.default.findByIdAndUpdate(vendorId, updateData, {
            new: true
        });
    }
    async updateBank(vendorId, updateData) {
        return await Vendor_1.default.findByIdAndUpdate(vendorId, {
            // $set: {
            //     'bankAccount.$': updateData
            // }
            bankAccount: updateData
        }, {
            new: true
        });
    }
    async updateLocation(vendorId, updateData //Partial<BankAccount>
    ) {
        return await Vendor_1.default.findByIdAndUpdate(vendorId, {
            // $set: {
            //     'bankAccount.$': updateData
            // }
            location: { coordinates: updateData.coordinates },
            status: updateData === null || updateData === void 0 ? void 0 : updateData.status
        }, {
            new: true
        });
    }
    // Delete a vendor
    async deleteVendor(vendorId) {
        return await Vendor_1.default.findByIdAndDelete(vendorId, { new: true });
    }
    async addNewCategory(vendorId, categoryId) {
        return await Vendor_1.default.findByIdAndUpdate(vendorId, { $push: { categories: categoryId } }, { new: true, safe: true, upsert: true });
    }
}
exports.default = new VendorRepository();
