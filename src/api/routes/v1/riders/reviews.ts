import { Router } from 'express';
import { Validate, Requirements } from '../../../middlewares/validator';
import Auth from '../../../middlewares/auth';
import reviewController from '../../../controllers/riders/ReviewController';
import advancedQuery from '../../../../api/middlewares/data/advancedQuery';
import ReviewModel from '../../../../api/models/Review';

const riderReviewRouter: Router = Router();

riderReviewRouter
    .route('/')
    .get(advancedQuery(ReviewModel), reviewController.getReviews);
// .post(reviewController.createReview);

riderReviewRouter.route('/reviewId').get(reviewController.getReviewDetails);
// .put(reviewController.updateReview);

export default riderReviewRouter;
