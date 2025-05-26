import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import VendorService from '../../../api/services/VendorService';
import appConfig from '../../../config/appConfig';

class VendorController {
    getVendors = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { categoryId } = req.params;

            if (categoryId) {
                const vendors = await VendorService.getVendorsByOption({
                    categoryId
                    // status: 'active'
                });

                res.status(STATUS.OK).json({ success: true, data: vendors });
            } else {
                const { advancedResults }: any = res;

                res.status(STATUS.OK).json(advancedResults);
            }
        }
    );

    getVendorsByCategory = asyncHandler(
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { categoryId } = req.params;
            const vendors = await VendorService.getVendorsByCategory(categoryId);
            res.status(STATUS.OK).json({ success: true, data: vendors });
        });

    getNearbyVendors = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const {
                longitude,
                latitude,
                maxDistance = appConfig.app.defaultNearbyDistance
            } = req.query;

            const vendors = await VendorService.getNearbyVendors(
                Number(longitude),
                Number(latitude),
                Number(maxDistance)
            );
            res.status(STATUS.OK).json({
                success: true,
                data: vendors
            });
        }
    );
    getVendorDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const vendor = await VendorService.getById(req.params.vendorId);

            res.status(STATUS.OK).json({
                success: true,
                data: vendor
            });
        }
    );
}

export default new VendorController();
