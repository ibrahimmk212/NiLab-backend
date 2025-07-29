import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import PromotionService from '../../services/PromotionService';
import CouponService from '../../services/CouponService';

class PromotionController {
    getPromotions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1 } = req.query;

            const { promotions, count, pagination, total } =
                await PromotionService.getPromotions(
                    Number(limit),
                    Number(page)
                );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: promotions
            });
        }
    );

    getCoupons = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { isActive } = req.query;
            const { limit = 10, page = 1 } = req.query;
            console.log(userdata);
            // TODO add active query
            const { coupons, count, pagination, total } =
                await CouponService.getCouponsByCustomer(
                    userdata.id,
                    Number(limit),
                    Number(page)
                );

            res.status(STATUS.OK).json({
                success: true,
                total,
                count,
                pagination,
                data: coupons
            });
        }
    );

    getPromotionDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const promotion = await PromotionService.getPromotionById(
                req.params.promotionId
            );

            res.status(STATUS.OK).json({
                success: true,
                data: promotion
            });
        }
    );

    validatePromotionCode = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { promotionCode } = req.query;

            const promotion = await PromotionService.getPromotionByKey(
                'code',
                promotionCode
            );
            if (!promotion) {
                throw Error('Invalid promotion code');
            }
            if (!promotion?.isActive) {
                throw Error('This promotion has ended');
            }
            res.status(STATUS.OK).json({
                success: true,
                data: promotion
            });
        }
    );
}

export default new PromotionController();
