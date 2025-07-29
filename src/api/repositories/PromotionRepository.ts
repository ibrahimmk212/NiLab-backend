import PromotionModel, { Promotion } from '../models/Promotion';

class PromotionRepository {
    async createPromotion(data: Partial<Promotion>): Promise<Promotion> {
        const promotion = new PromotionModel(data);
        return await promotion.save();
    }

    async findPromotions(limit = 10, page = 1): Promise<any> {
        const total = await PromotionModel.countDocuments();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const promotions = await PromotionModel.find()
            .populate('vendor')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

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

        return { promotions, count: promotions.length, pagination, total };
    }

    async findPromotionById(promotionId: string): Promise<Promotion | null> {
        return await PromotionModel.findById(promotionId).populate('vendor');
    }

    async findPromotionByKey(
        key: string,
        value: any
    ): Promise<Promotion | null> {
        return await PromotionModel.findOne({ [key]: value }).populate(
            'vendor'
        );
    }

    async findPromotionsByVendor(
        vendor: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await PromotionModel.countDocuments({ vendor });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const promotions = await PromotionModel.find({ vendor })
            .populate('vendor')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

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

        return { promotions, count: promotions.length, pagination, total };
    }

    async updatePromotion(
        promotionId: string,
        updateData: Partial<Promotion>
    ): Promise<Promotion | null> {
        return await PromotionModel.findByIdAndUpdate(promotionId, updateData, {
            new: true
        });
    }

    async deletePromotion(promotionId: string): Promise<Promotion | null> {
        return await PromotionModel.findByIdAndDelete(promotionId, {
            new: true
        });
    }

    // Additional promotion-specific methods...
}

export default new PromotionRepository();
