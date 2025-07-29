import ReviewRepository from '../repositories/ReviewRepository';
import { Review } from '../models/Review';

class ReviewService {
    async createReview(reviewData: Partial<Review>): Promise<Review> {
        return await ReviewRepository.createReview(reviewData);
    }

    async getReviewById(reviewId: string): Promise<Review | null> {
        return await ReviewRepository.findReviewById(reviewId);
    }

    async getReviewsByVendor(
        vendorId: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await ReviewRepository.findReviewsByCustomer(
            vendorId,
            limit,
            page
        );
    }

    async getReviewsByCustomer(
        customerId: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await ReviewRepository.findReviewsByCustomer(
            customerId,
            limit,
            page
        );
    }

    async getReviewsByRider(riderId: string): Promise<Review[] | null> {
        return await ReviewRepository.findReviewsByRider(riderId);
    }
    async updateReview(
        reviewId: string,
        updateData: Partial<Review>
    ): Promise<Review | null> {
        return await ReviewRepository.updateReview(reviewId, updateData);
    }

    async deleteReview(reviewId: string): Promise<Review | null> {
        return await ReviewRepository.deleteReview(reviewId);
    }

    // Additional review-specific business logic...
}

export default new ReviewService();
