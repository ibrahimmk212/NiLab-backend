import PromotionRepository from '../repositories/PromotionRepository';
import { Promotion } from '../models/Promotion';

class PromotionService {
    async createPromotion(
        promotionData: Partial<Promotion>
    ): Promise<Promotion> {
        return await PromotionRepository.createPromotion(promotionData);
    }
    async getPromotions(limit: number, page: number): Promise<any> {
        return await PromotionRepository.findPromotions(limit, page);
    }

    async getPromotionById(promotionId: string): Promise<Promotion | null> {
        return await PromotionRepository.findPromotionById(promotionId);
    }
    async getPromotionByKey(
        key: string,
        value: any
    ): Promise<Promotion | null> {
        return await PromotionRepository.findPromotionByKey(key, value);
    }
    async getPromotionsByVendor(
        vendorId: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await PromotionRepository.findPromotionsByVendor(
            vendorId,
            limit,
            page
        );
    }

    async updatePromotion(
        promotionId: string,
        updateData: Partial<Promotion>
    ): Promise<Promotion | null> {
        return await PromotionRepository.updatePromotion(
            promotionId,
            updateData
        );
    }

    async deletePromotion(promotionId: string): Promise<Promotion | null> {
        return await PromotionRepository.deletePromotion(promotionId);
    }

    // Additional promotion-specific business logic...
}

export default new PromotionService();
