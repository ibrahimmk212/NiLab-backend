import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import ProductRepository from '../../repositories/ProductRepository';
import VendorRepository from '../../repositories/VendorRepository';
import MarketCategoryModel from '../../models/MarketCategory';

class SearchController {
    universalSearch = asyncHandler(async (req: Request, res: Response) => {
        const { q, limit = 10, page = 1 } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Search query "q" is required'
            });
        }

        const numLimit = Number(limit);
        const numPage = Number(page);

        // Run queries in parallel
        const [productsResult, vendorsResult, categories] = await Promise.all([
            ProductRepository.getAll(
                { search: q, limit: numLimit, page: numPage },
                'user'
            ),
            VendorRepository.findAllVendors({
                search: q,
                status: 'active',
                limit: numLimit,
                page: numPage
            }),
            MarketCategoryModel.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ],
                active: true
            }).limit(numLimit)
        ]);

        res.status(STATUS.OK).json({
            success: true,
            message: 'Search completed successfully',
            products: productsResult,
            vendors: vendorsResult,
            categories
        });
    });
}

export default new SearchController();
