import CouponRepository from '../repositories/CouponRepository';
import { Coupon } from '../models/Coupon';

class CouponService {
    async createCoupon(couponData: Partial<Coupon>): Promise<Coupon> {
        return await CouponRepository.createCoupon(couponData);
    }
    async getCoupons(limit: number, page: number): Promise<any> {
        return await CouponRepository.findCoupons(limit, page);
    }
    async getCouponById(couponId: string): Promise<Coupon | null> {
        return await CouponRepository.findCouponById(couponId);
    }

    // async getCouponsByVendor(
    //     vendorId: string,
    //     limit: number,
    //     page: number
    // ): Promise<any> {
    //     return await CouponRepository.findCouponsByVendor(
    //         vendorId,
    //         limit,
    //         page
    //     );
    // }

    async getCouponsByCustomer(
        customerId: string,
        limit: number,
        page: number
    ): Promise<any> {
        return await CouponRepository.findCouponsByCustomer(
            customerId,
            limit,
            page
        );
    }

    async updateCoupon(
        couponId: string,
        updateData: Partial<Coupon>
    ): Promise<Coupon | null> {
        return await CouponRepository.updateCoupon(couponId, updateData);
    }

    async deleteCoupon(couponId: string): Promise<Coupon | null> {
        return await CouponRepository.deleteCoupon(couponId);
    }

    // Additional coupon-specific business logic...
}

export default new CouponService();
