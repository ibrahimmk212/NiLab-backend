"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Review_1 = __importDefault(require("../models/Review"));
class ReviewRepository {
    async createReview(data) {
        const review = new Review_1.default(data);
        return await review.save();
    }
    async findReviewById(reviewId) {
        return await Review_1.default.findById(reviewId);
    }
    async findReviewsByVendor(vendorId) {
        return await Review_1.default.find({ vendorId });
    }
    async findReviewsByCustomer(userId) {
        return await Review_1.default.find({ userId });
    }
    async findReviewsByRider(riderId) {
        return await Review_1.default.find({ riderId });
    }
    async updateReview(reviewId, updateData) {
        return await Review_1.default.findByIdAndUpdate(reviewId, updateData, {
            new: true
        });
    }
    async deleteReview(reviewId) {
        return await Review_1.default.findByIdAndDelete(reviewId, { new: true });
    }
}
exports.default = new ReviewRepository();
