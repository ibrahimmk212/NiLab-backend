/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import BannerService from '../../services/BannerService';

class BannerController {
    getAll = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const banners = await BannerService.getAll(req.query, false);
            res.status(STATUS.OK).send({
                success: true,
                message: 'Banners fetched successfully',
                ...banners
            });
        }
    );
}

export default new BannerController();
