import ReviewModel, { Review } from '../models/Review';

class ReviewRepository {
    async createReview(data: Partial<Review>): Promise<Review> {
        const review = new ReviewModel(data);
        return await review.save();
    }

    async findReviewById(reviewId: string): Promise<Review | null> {
        return await ReviewModel.findById(reviewId);
    }

    async findReviewsByVendor(vendorId: string): Promise<Review[] | null> {
        return await ReviewModel.find({ vendorId });
    }

    async findReviewsByCustomer(userId: string): Promise<Review[] | null> {
        return await ReviewModel.find({ userId });
    }

    async findReviewsByRider(riderId: string): Promise<Review[] | null> {
        return await ReviewModel.find({ riderId });
    }

    async updateReview(
        reviewId: string,
        updateData: Partial<Review>
    ): Promise<Review | null> {
        return await ReviewModel.findByIdAndUpdate(reviewId, updateData, {
            new: true
        });
    }

    async deleteReview(reviewId: string): Promise<Review | null> {
        return await ReviewModel.findByIdAndDelete(reviewId, { new: true });
    }

    // Additional review-specific methods...
}

export default new ReviewRepository();
