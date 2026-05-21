import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ReviewService from '../../services/ReviewService';
import { ReviewTargetType } from '../../models/Review';

class ReviewController {
    /** GET /reviews — customer's own review history */
    getReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1 } = req.query;

            const result = await ReviewService.getReviewsByCustomer(
                userdata.id,
                Number(limit),
                Number(page)
            );

            res.status(STATUS.OK).json({ success: true, ...result });
        }
    );

    /** GET /reviews/:reviewId — single review detail */
    getReviewDetails = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const review = await ReviewService.getReviewById(req.params.reviewId);
            if (!review) {
                res.status(STATUS.NOT_FOUND).json({ success: false, message: 'Review not found' });
                return;
            }
            res.status(STATUS.OK).json({ success: true, data: review });
        }
    );

    /** PUT /reviews/:reviewId — update own review (rating/comment/images) */
    updateReview = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { userdata }: any = req;
            const updated = await ReviewService.updateReview(
                req.params.reviewId,
                userdata.id,
                req.body
            );
            res.status(STATUS.OK).json({ success: true, data: updated });
        }
    );

    /** DELETE /reviews/:reviewId — delete own review */
    deleteReview = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { userdata }: any = req;
            await ReviewService.deleteReview(req.params.reviewId, userdata.id);
            res.status(STATUS.OK).json({ success: true, message: 'Review deleted successfully' });
        }
    );

    /** GET /reviews/vendor/:vendorId — public vendor reviews */
    getVendorReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { limit = 10, page = 1 } = req.query;
            const result = await ReviewService.getReviewsForTarget(
                'vendor',
                req.params.vendorId,
                Number(limit),
                Number(page)
            );
            res.status(STATUS.OK).json({ success: true, ...result });
        }
    );

    /** GET /reviews/rider/:riderId — public rider reviews */
    getRiderReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { limit = 10, page = 1 } = req.query;
            const result = await ReviewService.getReviewsForTarget(
                'rider',
                req.params.riderId,
                Number(limit),
                Number(page)
            );
            res.status(STATUS.OK).json({ success: true, ...result });
        }
    );

    /** GET /reviews/product/:productId — public product reviews */
    getProductReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { limit = 10, page = 1 } = req.query;
            const result = await ReviewService.getReviewsForTarget(
                'product',
                req.params.productId,
                Number(limit),
                Number(page)
            );
            res.status(STATUS.OK).json({ success: true, ...result });
        }
    );
}

export default new ReviewController();
