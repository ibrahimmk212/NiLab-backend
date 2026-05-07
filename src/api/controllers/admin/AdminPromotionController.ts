import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import PromotionService from '../../services/PromotionService';
import LogService from '../../services/LogService';
import { generatePromotionCode } from '../../../utils/helpers';

class PromotionController {
    getPromotions = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
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

    createPromotion = asyncHandler(
        async (req: Request, res: Response): Promise<void> => {
            const payload = req.body;
            // Only generate code if one isn't provided
            if (!payload.code) {
                payload.code = generatePromotionCode();
            }
            const promotion = await PromotionService.createPromotion(payload);

            res.status(STATUS.OK).json({
                success: true,
                data: promotion
            });

            // ✅ Audit Log
            await LogService.recordAction(
                (req as any).userdata.id,
                `Created new promotion: ${promotion.code} (${promotion.title})`
            );
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

    updatePromotionDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const payload = req.body;
            const promotion = await PromotionService.updatePromotion(
                req.params.promotionId,
                payload
            );

            if (!promotion) {
                throw Error('Promotion not found');
            }

            res.status(STATUS.OK).json({
                success: true,
                data: promotion
            });

            // ✅ Audit Log
            await LogService.recordAction(
                (req as any).userdata.id,
                `Updated promotion details: ${promotion.code}`
            );
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
