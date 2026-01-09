/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import CategoryService from '../../services/CategoryService';
import { slugify } from '../../../utils/helpers';

class VendorProductCategoryController {
    getAll = asyncHandler(async (req: any, res: Response): Promise<void> => {
        const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        req.query.limit = limit;
        req.query.page = page;
        const name = req.query.name ? String(req.query.name) : undefined;
        const search = req.query.search ? String(req.query.search) : undefined;
        const productCategory = await CategoryService.getAll({
            vendor: req.vendor.id,
            limit,
            page,
            name,
            search
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

    delete = asyncHandler(
        async (req: any, res: Response, next: NextFunction): Promise<void> => {
            const { id } = req.params;
            // check if category belongs to vendor
            const categoryToDelete = await CategoryService.find(id);
            if (categoryToDelete.vendor.toString() !== req.vendor.id) {
                throw new Error('Category not found');
            }
            await CategoryService.delete(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Category Deleted Successfully'
            });
        }
    );
}

export default new VendorProductCategoryController();
