import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import CategoryService from '../../services/CategoryService';

class CustomerMarketCategoryController {
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { vendor, name, status } = req.query;
            if (!vendor) {
                throw new Error('Vendor parameter is required');
            }
            const categories = await CategoryService.getAll({
                status: 'active',
                ...req.query
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: categories
            });
        }
    );
    getSingle = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            const category = await CategoryService.findActive(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Category fetched successfully',
                data: category
            });
        }
    );
}

export default new CustomerMarketCategoryController();
