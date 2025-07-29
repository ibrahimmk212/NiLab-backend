import ReviewModel, { Review } from '../models/Review';

class ReviewRepository {
    async createReview(data: Partial<Review>): Promise<Review> {
        const review = new ReviewModel(data);
        return await review.save();
    }

    async findReviewById(reviewId: string): Promise<Review | null> {
        return await ReviewModel.findById(reviewId);
    }

    async findReviewsByVendor(
        vendor: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await ReviewModel.countDocuments({ vendor });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const reviews = await ReviewModel.find({ vendor })
            .populate('product vendor')
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

        return { reviews, count: reviews.length, pagination, total };
    }

    async findReviewsByCustomer(
        userId: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await ReviewModel.countDocuments({ userId });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const reviews = await ReviewModel.find({ userId })
            .populate('product vendor')
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

        return { reviews, count: reviews.length, pagination, total };
    }

    async findReviewsByRider(riderId: string): Promise<Review[] | null> {
        return await ReviewModel.find({ riderId }).sort({ createdAt: -1 });
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
