import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ProductService from '../../../api/services/ProductService';

class ProductController {
    getProducts = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { categoryId, vendorId } = req.params;

            // check if categoryId exist, and then get products by category
            if (categoryId) {
                const products = await ProductService.getAllByCategory(
                    categoryId
                );
                res.status(STATUS.OK).json({
                    success: true,
                    data: products
                });
                // check if categoryId exist, and then get products by category
            } else if (vendorId) {
                const products = await ProductService.getAllByVendor(vendorId);
                res.status(STATUS.OK).json({
                    success: true,
                    data: products
                });
            } else {
                const { advancedResults }: any = res;
                res.status(STATUS.OK).json(advancedResults);
            }
        }
    );

    search = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const query = req.query;
            const product = await ProductService.search(query);
            res.status(STATUS.OK).send({
                message: 'Products fetched successfully',
                data: product
            });
        }
    );
}

export default new ProductController();
