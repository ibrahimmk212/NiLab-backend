import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ReviewService from '../../services/ReviewService';
import { ReviewTargetType } from '../../models/Review';

class AdminReviewController {
    /** GET /admin/reviews — list all reviews, filterable by targetType */
    getAllReviews = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { limit = 20, page = 1, targetType } = req.query;

            const filter: Record<string, any> = {};
            if (targetType && ['vendor', 'rider', 'product'].includes(targetType as string)) {
                filter.targetType = targetType as ReviewTargetType;
            }

            const result = await ReviewService.getAllReviews(filter, Number(limit), Number(page));
            res.status(STATUS.OK).json({ success: true, ...result });
        }
    );

    /** GET /admin/reviews/:reviewId — review detail */
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

    /** DELETE /admin/reviews/:reviewId — force-remove inappropriate review */
    deleteReview = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            await ReviewService.adminDeleteReview(req.params.reviewId);
            res.status(STATUS.OK).json({ success: true, message: 'Review removed successfully' });
        }
    );
}

export default new AdminReviewController();
