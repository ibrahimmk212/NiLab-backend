/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import CategoryService from '../../services/CategoryService';
import { slugify } from '../../../utils/helpers';

class VendorProductCategoryController {
    getAll = asyncHandler(async (req: any, res: Response): Promise<void> => {
        const productCategory = await CategoryService.getAll({
            vendor: req.vendor.id,
            ...req.query
        });
        res.status(STATUS.OK).send({
            success: true,
            message: 'Categories fetched successfully',
            ...productCategory
        });
    });
    getSingle = asyncHandler(async (req: any, res: Response): Promise<void> => {
        const { id } = req.params;

        const productCategory = await CategoryService.find(id);

        // check if category belongs to vendor
        if (productCategory.vendor.toString() !== req.vendor.id) {
            throw new Error('Category not found');
        }
        res.status(STATUS.OK).send({
            success: true,
            message: 'Categories fetched successfully',
            data: productCategory
        });
    });

    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const body = req.body;
            body.vendor = req.vendor.id;
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

    update = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            const { id } = req.params;
            const body = req.body;
            // check if category belongs to vendor
            const categoryToUpdate = await CategoryService.find(id);
            if (categoryToUpdate.vendor.toString() !== req.vendor.id) {
                throw new Error('Category not found');
            }

            const updatedSlug = slugify(body.name || categoryToUpdate.name);
            const category = await CategoryService.update(id, {
                ...body,
                slug: updatedSlug
            });
            res.status(STATUS.OK).send({
                success: true,
                message: 'Category Updated Successfully',
                data: category
            });
        }
    );
}

export default new VendorProductCategoryController();
