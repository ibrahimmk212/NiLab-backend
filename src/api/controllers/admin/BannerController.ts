/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import BannerService from '../../services/BannerService';

class BannerController {
    create = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banner = await BannerService.create(req.body);
            res.status(STATUS.CREATED).send({
                success: true,
                message: 'Banner created successfully',
                data: banner
            });
        }
    );

    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banners = await BannerService.getAll(req.query, true);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Banners fetched successfully',
                ...banners
            });
        }
    );

    getById = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banner = await BannerService.getById(req.params.id, true);
            if (!banner) {
                res.status(STATUS.NOT_FOUND).send({
                    success: false,
                    message: 'Banner not found'
                });
                return;
            }
            res.status(STATUS.OK).send({
                success: true,
                data: banner
            });
        }
    );

    update = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banner = await BannerService.update(req.params.id, req.body);
            if (!banner) {
                res.status(STATUS.NOT_FOUND).send({
                    success: false,
                    message: 'Banner not found'
                });
                return;
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Banner updated successfully',
                data: banner
            });
        }
    );

    delete = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banner = await BannerService.delete(req.params.id);
            if (!banner) {
                res.status(STATUS.NOT_FOUND).send({
                    success: false,
                    message: 'Banner not found'
                });
                return;
            }
            res.status(STATUS.OK).send({
                success: true,
                message: 'Banner deleted successfully'
            });
        }
    );
}

export default new BannerController();
