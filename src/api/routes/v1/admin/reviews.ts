import { Router } from 'express';
import adminReviewController from '../../../controllers/admin/AdminReviewController';

const adminReviewRouter: Router = Router();

adminReviewRouter.get('/', adminReviewController.getAllReviews);
adminReviewRouter.get('/:reviewId', adminReviewController.getReviewDetails);
adminReviewRouter.delete('/:reviewId', adminReviewController.deleteReview);

export default adminReviewRouter;
