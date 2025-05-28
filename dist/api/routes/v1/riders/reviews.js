"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewController_1 = __importDefault(require("../../../controllers/riders/ReviewController"));
const advancedQuery_1 = __importDefault(require("../../../../api/middlewares/data/advancedQuery"));
const Review_1 = __importDefault(require("../../../../api/models/Review"));
const riderReviewRouter = (0, express_1.Router)();
riderReviewRouter
    .route('/')
    .get((0, advancedQuery_1.default)(Review_1.default), ReviewController_1.default.getReviews)
    .post(ReviewController_1.default.createReview);
riderReviewRouter
    .route('/reviewId')
    .get(ReviewController_1.default.getReviewDetails)
    .put(ReviewController_1.default.updateReview);
exports.default = riderReviewRouter;
