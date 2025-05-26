import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';

class CategoryController {
    getCategories = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { advancedResults }: any = res;

            res.status(STATUS.OK).json(advancedResults);
        }
    );
}

export default new CategoryController();
