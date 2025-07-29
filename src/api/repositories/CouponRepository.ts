import CouponModel, { Coupon } from '../models/Coupon';

class CouponRepository {
    async createCoupon(data: Partial<Coupon>): Promise<Coupon> {
        const coupon = new CouponModel(data);
        return await coupon.save();
    }
    async findCoupons(limit = 10, page = 1): Promise<any> {
        const total = await CouponModel.countDocuments();
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const coupons = await CouponModel.find()
            .populate('user promotion')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { coupons, count: coupons.length, pagination, total };
    }
    async findCouponById(couponId: string): Promise<Coupon | null> {
        return await CouponModel.findById(couponId);
    }
    async findCouponsByCustomer(
        user: string,
        limit = 10,
        page = 1
    ): Promise<any> {
        const total = await CouponModel.countDocuments({ user });
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const coupons = await CouponModel.find({ user })
            .populate('promotion vendor user')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        // Pagination results
        const pagination: any = {};
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        return { coupons, count: coupons.length, pagination, total };
    }

    async updateCoupon(
        couponId: string,
        updateData: Partial<Coupon>
    ): Promise<Coupon | null> {
        return await CouponModel.findByIdAndUpdate(couponId, updateData, {
            new: true
        });
    }

    async deleteCoupon(couponId: string): Promise<Coupon | null> {
        return await CouponModel.findByIdAndDelete(couponId, {
            new: true
        });
    }

    // Additional coupon-specific methods...
}

export default new CouponRepository();
