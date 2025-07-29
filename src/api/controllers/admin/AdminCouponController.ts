import { NextFunction, Request, Response } from 'express';
import { STATUS } from '../../../constants';
import { asyncHandler } from '../../middlewares/handlers/async';
import CouponService from '../../services/CouponService';

class CouponController {
    getCoupons = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const { userdata }: any = req;
            const { limit = 10, page = 1 } = req.query;

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

    getCouponDetails = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<void> => {
            const coupon = await CouponService.getCouponById(
                req.params.couponId
            );

            if (!coupon) {
                throw Error('Coupon not found!');
            }

            res.status(STATUS.OK).json({
                success: true,
                data: coupon
            });
        }
    );

    // deleteCoupon = asyncHandler(
    //     async (
    //         req: Request,
    //         res: Response,
    //         next: NextFunction
    //     ): Promise<void> => {
    //         const coupon = await CouponService.deleteCoupon(
    //             req.params.couponId
    //         );

    //         res.status(STATUS.OK).json({
    //             success: true,
    //             data: coupon
    //         });
    //     }
    // );
}

export default new CouponController();
