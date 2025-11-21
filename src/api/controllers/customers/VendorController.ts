/* eslint-disable @typescript-eslint/no-unused-vars */
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
            const vendors = await VendorService.getAll(req.query);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Vendors fetched successfully',
                ...vendors
            });
        }
    );

    searchVendors = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { limit = 10, page = 1, search = '', category } = req.query;

            const { vendors, count, pagination, total } = category
                ? await VendorService.getVendorsByOption(
                      {
                          //   categories: { $in: category }
                          //   status: 'active'
                      },
                      Number(limit),
                      Number(page)
                  )
                : await VendorService.searchVendors(
                      search as string,
                      Number(limit),
                      Number(page)
                  );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: vendors
            });
        }
    );

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
                Number(latitude),
                Number(longitude),
                Number(maxDistance),
                req.query
            );
            // vendors.map((vendor: Vendor) => vendor.populate('categories'));
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
