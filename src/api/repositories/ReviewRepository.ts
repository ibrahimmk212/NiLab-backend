import ReviewModel, { Review, ReviewTargetType } from '../models/Review';
import mongoose from 'mongoose';

const userPopulate = {
    path: 'user',
    select: 'firstName lastName avatar'
};

class ReviewRepository {
    async createReview(data: Partial<Review>): Promise<Review> {
        const review = new ReviewModel(data);
        return await review.save();
    }

    async findReviewById(reviewId: string): Promise<Review | null> {
        return await ReviewModel.findById(reviewId)
            .populate(userPopulate)
            .populate('vendor', 'businessName logo')
            .populate('rider', 'firstName lastName avatar')
            .populate('product', 'name images');
    }

    /** Check if a review already exists for this order/user/targetType combination */
    async findExistingReview(
        orderId: string,
        userId: string,
        targetType: ReviewTargetType
    ): Promise<Review | null> {
        return await ReviewModel.findOne({
            order: new mongoose.Types.ObjectId(orderId),
            user: new mongoose.Types.ObjectId(userId),
            targetType
        });
    }

    async findReviewsByVendor(
        vendorId: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        return this._paginatedFind({ vendor: vendorId, targetType: 'vendor' }, limit, page);
    }

    async findReviewsByRider(
        riderId: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        return this._paginatedFind({ rider: riderId, targetType: 'rider' }, limit, page);
    }

    async findReviewsByProduct(
        productId: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        return this._paginatedFind({ product: productId, targetType: 'product' }, limit, page);
    }

    async findReviewsByCustomer(
        userId: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        return this._paginatedFind({ user: userId }, limit, page);
    }

    async findAllReviews(
        filter: Record<string, any> = {},
        limit = 20,
        page = 1
    ): Promise<any> {
        return this._paginatedFind(filter, limit, page);
    }

    async updateReview(
        reviewId: string,
        updateData: Partial<Review>
    ): Promise<Review | null> {
        return await ReviewModel.findByIdAndUpdate(reviewId, updateData, {
            new: true,
            runValidators: true
        });
    }

    async deleteReview(reviewId: string): Promise<Review | null> {
        const review = await ReviewModel.findById(reviewId);
        if (review) await review.deleteOne();
        return review;
    }

    /** Shared paginated query helper */
    private async _paginatedFind(
        filter: Record<string, any>,
        limit: number,
        page: number
    ): Promise<any> {
        const total = await ReviewModel.countDocuments(filter);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const reviews = await ReviewModel.find(filter)
            .populate(userPopulate)
            .populate('vendor', 'businessName logo')
            .populate('rider', 'firstName lastName avatar')
            .populate('product', 'name images')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        const pagination: any = {};
        if (endIndex < total) pagination.next = { page: page + 1, limit };
        if (startIndex > 0) pagination.prev = { page: page - 1, limit };

        return { reviews, count: reviews.length, pagination, total };
    }
}

export default new ReviewRepository();
