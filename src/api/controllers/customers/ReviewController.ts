import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ReviewService from '../../services/ReviewService';

class ReviewController {
    getReviews = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1 } = req.query;

            const { reviews, count, pagination, total } =
                await ReviewService.getReviewsByCustomer(
                    userdata.id,
                    Number(limit),
                    Number(page)
                );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: reviews
            });
        }
    );

    getReviewDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
        }
    );

    updateReview = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
        }
    );
}

export default new ReviewController();
