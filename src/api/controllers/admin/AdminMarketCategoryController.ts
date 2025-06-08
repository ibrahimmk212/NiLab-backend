import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VendorCategoryService from '../../services/MarketCategoryService';

class AdminVendorCategoryController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const newCategory = await VendorCategoryService.create(req.body);
            if (!newCategory)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create category'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Category Created Successfully',
                data: newCategory
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const updated = await VendorCategoryService.update(id, req.body);
            if (!updated)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to update Category'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Category Updated Successfully.',
                data: updated
            });
        }
    );
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const product = await VendorCategoryService.getAll();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories fetched successfully',
                data: product
            });
        }
    );
    getSingle = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const { id } = req.params;
            const product = await VendorCategoryService.find(id);
            if (!product) {
                res.status(STATUS.NOT_FOUND).send({
                    success: false,
                    message: 'Category not found',
                    data: product
                });
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Category fetched successfully',
                data: product
            });
        }
    );
}

export default new AdminVendorCategoryController();
