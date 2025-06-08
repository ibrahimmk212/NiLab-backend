import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import MarketCategoryService from '../../services/MarketCategoryService';

class MarketCategoryController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const product = await MarketCategoryService.getAll();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        }
    );
    getSingle = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const product = await MarketCategoryService.find(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        }
    );
}

export default new MarketCategoryController();
