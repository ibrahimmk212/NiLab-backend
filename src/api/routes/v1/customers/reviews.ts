import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import reviewController from '../../../controllers/customers/ReviewController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import ReviewModel from '../../../../api/models/Review';

const customerReviewRouter: Router = Router();

customerReviewRouter
    .route('/')
    .get(advancedQuery(ReviewModel), reviewController.getReviews)
    .post(reviewController.createReview);

customerReviewRouter
    .route('/reviewId')
    .get(reviewController.getReviewDetails)
    .put(reviewController.updateReview);

export default customerReviewRouter;
