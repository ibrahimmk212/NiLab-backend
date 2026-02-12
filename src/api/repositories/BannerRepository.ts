/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import BannerModel, { Banner } from '../models/Banner';

class BannerRepository {
    async createBanner(data: any): Promise<Banner> {
        const banner = new BannerModel(data);
        return await banner.save();
    }

    async findBannerById(bannerId: string): Promise<Banner | null> {
        if (!mongoose.Types.ObjectId.isValid(bannerId)) return null;
        return await BannerModel.findById(bannerId);
    }

    async findActiveBannerById(bannerId: string): Promise<Banner | null> {
        if (!mongoose.Types.ObjectId.isValid(bannerId)) return null;
        return await BannerModel.findOne({
            _id: bannerId,
            status: 'active',
            isDeleted: false
        });
    }

    async findAll(options: any, includeInactive = false) {
        const page = Number(options.page) || 1;
        const limit = Number(options.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: Record<string, any> = {};

        if (!includeInactive) {
            filter.status = 'active';
        }
        filter.isDeleted = false;


        if (options.status && includeInactive) {
             filter.status = options.status;
        }

        if (options.type) {
            filter.type = options.type;
        }

        const [banners, total] = await Promise.all([
            BannerModel.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            BannerModel.countDocuments(filter)
        ]);

        return {
            total,
            count: banners.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: banners
        };
    }

    async updateBanner(
        bannerId: string,
        updateData: Partial<Banner>
    ): Promise<Banner | null> {
        return await BannerModel.findByIdAndUpdate(bannerId, updateData, {
            new: true,
            runValidators: true
        });
    }

    async deleteBanner(bannerId: string): Promise<Banner | null> {
        return await BannerModel.findByIdAndUpdate(
            bannerId,
            {
                isDeleted: true,
                status: 'inactive'
            },
            { new: true }
        );
    }
}

export default new BannerRepository();
