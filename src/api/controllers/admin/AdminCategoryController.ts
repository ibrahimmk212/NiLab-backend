import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import CategoryService from '../../services/CategoryService';

class AdminCategoryController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const newCategory = await CategoryService.create(req.body);
            if (!newCategory)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Product'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Product Created Successfully',
                data: newCategory
            });
        }
    );
    getAll = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const product = await CategoryService.getAll(req.query);
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

    update = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { id } = req.params;
            const { name, description } = req.body;
            // const product = await CategoryService.find(id);
            const category = await CategoryService.update(id, {
                name,
                description
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Categories updated successfully',
                data: category
            });
        }
    );
}

export default new AdminCategoryController();
