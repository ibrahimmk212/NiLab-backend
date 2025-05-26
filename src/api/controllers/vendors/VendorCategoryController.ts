import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import SubcategoryService from '../../services/SubcategoryService';
import CategoryService from '../../services/CategoryService';

class VendorCategoryController {
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const product = await CategoryService.getAll();
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
            const product = await CategoryService.find(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        }
    );
}

export default new VendorCategoryController();
