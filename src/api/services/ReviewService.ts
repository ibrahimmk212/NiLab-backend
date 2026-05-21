import ReviewRepository from '../repositories/ReviewRepository';
import { Review, ReviewTargetType } from '../models/Review';
import OrderModel from '../models/Order';
import mongoose from 'mongoose';

export interface SubmitReviewPayload {
    rating: number;
    comment?: string;
    images?: string[];
    rateVendor?: boolean;
    rateRider?: boolean;
    rateProduct?: boolean;
}

class ReviewService {
    /**
     * Submit a review for a delivered order.
     * One Review document is created per target (vendor/rider/product).
     * Duplicate submissions for the same order+user+targetType are rejected.
     */
    async submitOrderReview(
        orderId: string,
        userId: string,
        payload: SubmitReviewPayload
    ): Promise<Review[]> {
        const { rating, comment, images, rateVendor = true, rateRider = false, rateProduct = false } = payload;

        // 1. Validate the order
        const order = await OrderModel.findById(orderId);
        if (!order) throw new Error('Order not found');

        const orderUserId = String(
            (order.user as any)?._id ?? order.user
        );

        if (orderUserId !== userId) {
            throw Object.assign(new Error('You can only review your own orders'), { statusCode: 403 });
        }

        if (order.status !== 'delivered') {
            throw Object.assign(new Error('You can only review delivered orders'), { statusCode: 400 });
        }

        const targets: { targetType: ReviewTargetType; targetId: mongoose.Types.ObjectId | undefined }[] = [];

        if (rateVendor && order.vendor) {
            targets.push({ targetType: 'vendor', targetId: order.vendor as mongoose.Types.ObjectId });
        }
        if (rateRider && order.rider) {
            targets.push({ targetType: 'rider', targetId: order.rider as mongoose.Types.ObjectId });
        }
        if (rateProduct && order.products?.length > 0) {
            // Rate the first product in the order (primary item)
            const firstProductId = order.products[0].product as mongoose.Types.ObjectId;
            targets.push({ targetType: 'product', targetId: firstProductId });
        }

        if (targets.length === 0) {
            throw Object.assign(new Error('No valid review targets specified'), { statusCode: 400 });
        }

        // 2. Create reviews, skipping already-reviewed targets
        const created: Review[] = [];
        for (const { targetType, targetId } of targets) {
            if (!targetId) continue;

            const existing = await ReviewRepository.findExistingReview(orderId, userId, targetType);
            if (existing) continue; // silently skip duplicates

            const reviewData: Partial<Review> = {
                user: new mongoose.Types.ObjectId(userId),
                order: new mongoose.Types.ObjectId(orderId),
                rating,
                comment,
                images,
                targetType,
                [targetType]: targetId
            };

            const review = await ReviewRepository.createReview(reviewData);
            created.push(review);
        }

        // 3. Mark order as rated if any reviews were created
        if (created.length > 0 && !order.rated) {
            order.rated = true;
            await order.save();
        }

        return created;
    }

    /** Get paginated reviews for any target (vendor / rider / product) */
    async getReviewsForTarget(
        targetType: ReviewTargetType,
        targetId: string,
        limit: number,
        page: number
    ): Promise<any> {
        switch (targetType) {
            case 'vendor':
                return ReviewRepository.findReviewsByVendor(targetId, limit, page);
            case 'rider':
                return ReviewRepository.findReviewsByRider(targetId, limit, page);
            case 'product':
                return ReviewRepository.findReviewsByProduct(targetId, limit, page);
        }
    }

    async getReviewsByCustomer(userId: string, limit: number, page: number): Promise<any> {
        return ReviewRepository.findReviewsByCustomer(userId, limit, page);
    }

    async getReviewById(reviewId: string): Promise<Review | null> {
        return ReviewRepository.findReviewById(reviewId);
    }

    async getAllReviews(filter: Record<string, any>, limit: number, page: number): Promise<any> {
        return ReviewRepository.findAllReviews(filter, limit, page);
    }

    /**
     * Update a review — only the original author may edit.
     */
    async updateReview(
        reviewId: string,
        userId: string,
        data: Partial<Review>
    ): Promise<Review | null> {
        const review = await ReviewRepository.findReviewById(reviewId);
        if (!review) throw Object.assign(new Error('Review not found'), { statusCode: 404 });

        const ownerId = review.user instanceof mongoose.Types.ObjectId
            ? review.user.toString()
            : (review.user as any)._id?.toString();

        if (ownerId !== userId) {
            throw Object.assign(new Error('Not authorized to update this review'), { statusCode: 403 });
        }

        // Only allow rating/comment/images to be updated
        const allowed: Partial<Review> = {};
        if (data.rating !== undefined) allowed.rating = data.rating;
        if (data.comment !== undefined) allowed.comment = data.comment;
        if (data.images !== undefined) allowed.images = data.images;

        return ReviewRepository.updateReview(reviewId, allowed);
    }

    /**
     * Delete a review — only the original author may delete.
     */
    async deleteReview(reviewId: string, userId: string): Promise<void> {
        const review = await ReviewRepository.findReviewById(reviewId);
        if (!review) throw Object.assign(new Error('Review not found'), { statusCode: 404 });

        const ownerId = review.user instanceof mongoose.Types.ObjectId
            ? review.user.toString()
            : (review.user as any)._id?.toString();

        if (ownerId !== userId) {
            throw Object.assign(new Error('Not authorized to delete this review'), { statusCode: 403 });
        }

        await ReviewRepository.deleteReview(reviewId);
    }

    /** Admin force-delete without ownership check */
    async adminDeleteReview(reviewId: string): Promise<void> {
        const review = await ReviewRepository.findReviewById(reviewId);
        if (!review) throw Object.assign(new Error('Review not found'), { statusCode: 404 });
        await ReviewRepository.deleteReview(reviewId);
    }
}

export default new ReviewService();
