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
            const limit = req.query.limit
                ? parseInt(req.query.limit as string, 10)
                : 10;
            const page = req.query.page
                ? parseInt(req.query.page as string, 10)
                : 1;
            const { name, search, category, minPrice, stock, vendorId } =
                req.query;
            const products = await ProductService.getAll(
                {
                    limit,
                    page,
                    name,
                    search,
                    category,
                    minPrice,
                    stock,
                    available: true,
                    vendorId
                },
                'user'
            );
            res.status(STATUS.OK).send({
                success: true,
                message: 'products fetched successfully',
                ...products
            });
        }
    );

    // searchProducts = asyncHandler(
    //     async (
    //         req: Request,
    //         res: Response,
    //         next: NextFunction
    //     ): Promise<void> => {
    //         const { vendorId } = req.params;

    //         const { limit = 10, page = 1, search = '', category } = req.query;

    //         const queryParams = { vendor: vendorId };

    //         const { products, count, pagination, total } = category
    //             ? await ProductService.getProductsByOption(
    //                   {
    //                       vendor: vendorId,
    //                       category
    //                   },
    //                   Number(limit),
    //                   Number(page)
    //               )
    //             : await ProductService.searchProducts(
    //                   search as string,
    //                   Number(limit),
    //                   Number(page),
    //                   queryParams
    //               );

    //         res.status(STATUS.OK).json({
    //             success: true,
    //             total,
    //             count,
    //             pagination,
    //             data: products
    //         });
    //     }
    // );

    getProductById = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { productId } = req.params;

            const product: any = await ProductService.findById(
                productId,
                'user'
            );
            const favourites: [] = product.favourites;
            product.favourite = false;

            favourites.map((fav: any) => {
                if (fav.user._id == userdata.id) {
                    product.favourite = true;
                }
            });

            res.status(STATUS.OK).json({
                success: true,
                data: product
            });
        }
    );
}

export default new ProductController();
