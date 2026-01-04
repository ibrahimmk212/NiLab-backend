import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import VendorService from '../../services/VendorService';
// import { uploadFileToS3 } from '../../../utils/s3';
import path from 'path';

class ProductController {
    // createCategory = asyncHandler(
    //     async (
    //         req: Request | any,
    //         res: Response,
    //         next: NextFunction
    //     ): Promise<void> => {
    //         const newCategory = await CategoryService.create({
    //             ...req.body,
    //             vendor: req.vendor._id
    //         });
    //         if (!newCategory)
    //             res.status(STATUS.BAD_REQUEST).send({
    //                 success: false,
    //                 message: 'Failed to create Product'
    //             });
    //         res.status(STATUS.OK).send({
    //             success: true,
    //             message: 'Product Created Successfully',
    //             data: newCategory
    //         });
    //     }
    // );
    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const {
                page = '1',
                limit = '10',
                sortBy = 'createdAt',
                sortOrder = 'desc',
                search,
                ...restFilters
            } = req.query;

            const result = await ProductService.getAll(req.query);
            // TODO populate categories
            res.status(STATUS.OK).send({
                message: 'Products fetched successfully',
                ...result
            });
        }
    );
    search = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const query = req.query;
            const limit = parseInt(query.limit as string) || 10;
            const page = parseInt(query.page as string) || 1;
            const search = (query.search as string) || '';
            const options: Record<string, unknown> = {
                search,
                limit,
                page
            };
            const product = await ProductService.searchProducts(
                search,
                limit,
                page,
                options
            );
            res.status(STATUS.OK).send({
                message: 'Products fetched successfully',
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
            const product = await ProductService.findById(id);

            if (!product) throw new Error('Product not foud');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Product fetched successfully',
                data: product
            });
        }
    );
    getAllCategories = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req.params;
            const categories = await CategoryService.getAll({
                vendor: vendor,
                status: 'active',
                ...req.query
            });
            res.status(STATUS.OK).send({
                message: 'Categories fetched successfully',
                data: categories
            });
        }
    );
}

export default new ProductController();
