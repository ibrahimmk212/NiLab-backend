import { Router } from 'express';
import reviewController from '../../../controllers/customers/ReviewController';

const customerReviewRouter: Router = Router();

// ─── Authenticated: Customer's own reviews ───────────────────────────────────
customerReviewRouter.get('/', reviewController.getReviews);
customerReviewRouter.get('/:reviewId', reviewController.getReviewDetails);
customerReviewRouter.put('/:reviewId', reviewController.updateReview);
customerReviewRouter.delete('/:reviewId', reviewController.deleteReview);

// ─── Public: Reviews by target ───────────────────────────────────────────────
customerReviewRouter.get('/vendor/:vendorId', reviewController.getVendorReviews);
customerReviewRouter.get('/rider/:riderId', reviewController.getRiderReviews);
customerReviewRouter.get('/product/:productId', reviewController.getProductReviews);

export default customerReviewRouter;
