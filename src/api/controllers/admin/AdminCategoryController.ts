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
            const body = req.body;
            body.vendor = null; // Admin categories are global
            const newCategory = await CategoryService.create(body);
            if (!newCategory)
                res.status(STATUS.BAD_REQUEST).send({
                    success: false,
                    message: 'Failed to create Category'
                });
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Category Created Successfully',
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
            const product = await CategoryService.getAll({
                ...req.query,
                onlyGlobal: true
            });
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
            
            if (product && product.vendor) {
                res.status(STATUS.FORBIDDEN).send({
                    success: false,
                    message: 'This category belongs to a vendor and cannot be managed here'
                });
                return;
            }

            res.status(STATUS.OK).send({
                success: true,
                message: 'Category fetched successfully',
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
            
            const categoryToUpdate = await CategoryService.find(id);
            if (!categoryToUpdate || categoryToUpdate.vendor) {
                res.status(STATUS.FORBIDDEN).send({
                    success: false,
                    message: 'Cannot update vendor-owned categories'
                });
                return;
            }

            const category = await CategoryService.update(id, {
                name,
                description,
                vendor: null // Ensure it remains global
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
