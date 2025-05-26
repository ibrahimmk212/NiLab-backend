import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class ReviewController {
    getReviews = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { advancedResults }: any = res;

            res.status(STATUS.OK).json(advancedResults);
        }
    );

    createReview = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            throw Error('not implemented');
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
