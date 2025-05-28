"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ReviewRepository_1 = __importDefault(require("../repositories/ReviewRepository"));
class ReviewService {
    async createReview(reviewData) {
        return await ReviewRepository_1.default.createReview(reviewData);
    }
    async getReviewById(reviewId) {
        return await ReviewRepository_1.default.findReviewById(reviewId);
    }
    async getReviewsByVendor(vendorId) {
        return await ReviewRepository_1.default.findReviewsByVendor(vendorId);
    }
    async getReviewsByCustomer(customerId) {
        return await ReviewRepository_1.default.findReviewsByCustomer(customerId);
    }
    async getReviewsByRider(riderId) {
        return await ReviewRepository_1.default.findReviewsByRider(riderId);
    }
    async updateReview(reviewId, updateData) {
        return await ReviewRepository_1.default.updateReview(reviewId, updateData);
    }
    async deleteReview(reviewId) {
        return await ReviewRepository_1.default.deleteReview(reviewId);
    }
}
exports.default = new ReviewService();
