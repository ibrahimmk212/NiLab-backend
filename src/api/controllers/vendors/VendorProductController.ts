/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ProductService from '../../services/ProductService';
import CategoryService from '../../services/CategoryService';
import VendorService from '../../../api/services/VendorService';
// import { uploadFileToS3 } from '../../../utils/s3';
import path from 'path';

type UserRole = 'admin' | 'vendor' | 'user';

class VendorProductController {
    create = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body } = req;

            const newProduct = await ProductService.create({
                ...body,
                vendor: vendor.id,
                thumbnail:
                    body.thumbnail ||
                    'https://via.placeholder.com/150?text=No+Image'
            });
            if (!newProduct) {
                throw Error('Failed to create Product');
            }

            await VendorService.addCategory(vendor.id, body.category);

            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Product Created Successfully',
                data: newProduct
            });
        }
    );

    getAll = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor } = req;

            const product = await ProductService.getAll(
                {
                    ...req.query,
                    vendorId: vendor.id
                },
                'vendor'
            );
            // TODO populate categories
            res.status(STATUS.OK).send({
                message: 'Products fetched successfully',
                ...product
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
            const product = await ProductService.findById(id, 'vendor');

            if (!product) throw new Error('Product not foud');
            res.status(STATUS.OK).send({
                success: true,
                message: 'Product fetched successfully',
                data: product
            });
        }
    );
    getAllCategories = asyncHandler(
        async (req: any, res: Response): Promise<void> => {
            const categories = await CategoryService.getAll({
                vendor: req.vendor.id,
                ...req.query
            });
            res.status(STATUS.OK).send({
                message: 'Categories fetched successfully',
                data: categories
            });
        }
    );

    update = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const getProduct = await ProductService.findById(id);

            if (!getProduct) {
                throw Error('Product not found');
            }
            if (getProduct.vendor._id.toString() !== vendor.id) {
                throw Error('Unauthorized');
            }

            const newProduct = await ProductService.update(id, body);
            if (!newProduct) {
                throw Error('Failed to update Product');
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Product Updated Successfully',
                data: newProduct
            });
        }
    );

    updateAvailability = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, body, params } = req;
            const { id } = params;

            const product = await ProductService.findById(id);

            if (!product) {
                throw Error('Product not found');
            }

            product.isAvailable = !product.isAvailable;
            await product.save();
            res.status(STATUS.OK).send({
                success: true,
                message: 'Product Updated Successfully',
                data: product
            });
        }
    );

    delete = asyncHandler(
        async (
            req: Request | any,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { vendor, params } = req;
            const { id } = params;
            const product = await ProductService.findById(id);

            if (!product) {
                throw Error('Product not found');
            }
            if (product.vendor._id.toString() !== vendor.id) {
                throw Error('Unauthorized');
            }
            await ProductService.delete(id);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Product Deleted Successfully'
            });
        }
    );
}

export default new VendorProductController();
