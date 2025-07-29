import mongoose, { Document, Schema } from 'mongoose';

export interface Coupon extends Document {
    vendor: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    promotion: mongoose.Types.ObjectId;
    discountPercentage: number;
    discountAmount: number;
    title: string;
    maxAmount: number;
    eligibleAmount: number;

    daysToExpire: number;
    code: string;
    discountType: 'percentage' | 'amount';
    // startDate: Date;
    expiresOn: Date;
    isActive: boolean;
}

const couponSchema = new Schema<Coupon>(
    {
        vendor: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: false
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        promotion: {
            type: Schema.Types.ObjectId,
            ref: 'Promotion',
            required: false
        },
        title: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        discountPercentage: { type: Number, required: false },
        discountType: { type: String, required: true },
        discountAmount: { type: Number, required: false },
        maxAmount: { type: Number, required: false },
        eligibleAmount: { type: Number, required: false },
        // daysToExpire: { type: Number, required: true },
        // startDate: { type: Date, required: true },
        expiresOn: { type: Date, required: true },
        isActive: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    }
);

const CouponModel = mongoose.model<Coupon>('Coupon', couponSchema);

export default CouponModel;
